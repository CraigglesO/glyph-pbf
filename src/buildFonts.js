// @flow
import fs from 'fs'
import { gzipSync } from 'zlib'
import * as opentype from 'opentype.js'
import serialize from './serialize'

export type Glyph = {
  advanceWidth: number,
  yOffset: numnber,
  path: Array<number>
}

export type KernSet = Array<Kern>

export type Kern = {
  from: number,
  to: number,
  amount: number
}

type Command = {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z',
  x?: number,
  y?: number,
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number
}

type Font = {
  font: string | Object, // either a path to the font, or the font has already been build by opentype
  charset: string
}

type Code = { yOffset: number, maxY: number, scale: number, path: Array<number> }

export default function buildFonts (fonts: Array<Font>, out: string) {
  // step 1, build a glyph set
  const [glyphMap, kernSet] = buildGlyphSet(fonts)
  // step 2, build the pbf
  const pbf = serialize(glyphMap, kernSet)
  // step 3, gzip compress and save
  fs.writeFileSync(out, gzipSync(pbf))
}

function buildGlyphSet (fonts: Array<Font>): Map {
  const kernSet = []
  const glyphMap = new Map()
  const unicodeMap = new Map()
  let fontMinY = Infinity
  for (const font of fonts) {
    const { path, charset } = font
    // build font data
    const data = opentype.loadSync(path)
    const { unitsPerEm, glyphs, ascender, descender, kerningPairs } = data
    // glyph map
    for (const key in glyphs.glyphs) {
      const glyph = glyphs.glyphs[key]
      const { unicode, index, advanceWidth } = glyph
      if (glyph && unicode && index && advanceWidth && !glyphMap.has(unicode) && (!charset || charset.includes(String.fromCharCode(unicode)))) {
        let code = commandsToCode(glyph.getPath(0, 0, 1).commands)
        const { yOffset, yMax, path } = code
        fontMinY = Math.min(fontMinY, yOffset)
        glyphMap.set(unicode, {
          advanceWidth: Math.round(advanceWidth / unitsPerEm * 4096),
          yMax,
          path
        })
        unicodeMap.set(index, unicode)
      }
    }

    // shift all glyphs by the font's minY
    const scale = 4096 / (4096 - fontMinY)
    for (const [unicode, glyph] of glyphMap) updateYOffsetAndScale(glyph, fontMinY, scale)

    // kerning map
    for (const kernKey in kerningPairs) {
      const [from, to] = kernKey.split(',')
      from = getUnicode(unicodeMap, +from)
      to = getUnicode(unicodeMap, +to)
      if (!from || !to) continue
      const amount = Math.round(kerningPairs[kernKey] / unitsPerEm * 4096)
      if (!amount) continue
      kernSet.push({ from, to, amount })
    }
  }

  return [glyphMap, kernSet]
}

function getUnicode (unicodeMap: Set, index: number) {
  if (unicodeMap.has(index)) return unicodeMap.get(index)
}

function commandsToCode (commands: Array<Command>): Code {
  let prevX: number, prevY: number, add: number, yVal: number
  let yOffset: number = Infinity
  let yMax: number = -Infinity
  const path = []
  commands.forEach(command => {
    const { type, x, y, x1, y1, x2, y2 } = command
    add = x === prevX && y === prevY
    prevX = x
    prevY = y
    if (type !== 'Z') {
      yVal = Math.round(-y * 4096)
      yOffset = Math.min(yOffset, yVal)
      yMax = Math.max(yMax, yVal)
    }
    if (type === 'M') { // Move to
      path.push(0, Math.round(x * 4096), Math.round(-y * 4096))
    } else if (type === 'L') { // Line to
      if (!add) path.push(1, Math.round(x * 4096), Math.round(-y * 4096))
    } else if (type === 'C') { // Cubic Bezier
      if (!add) path.push(2, Math.round(x2 * 4096), Math.round(-y2 * 4096), Math.round(x1 * 4096), Math.round(-y1 * 4096), Math.round(x * 4096), Math.round(-y * 4096))
    } else if (type === 'Q') { // Quadratic Bezier
      if (!add) path.push(3, Math.round(x1 * 4096), Math.round(-y1 * 4096), Math.round(x * 4096), Math.round(-y * 4096))
    } else if (type === 'Z') { // finish
      path.push(4)
    }
  })

  return { yOffset, yMax, path }
}

// If yOffset is below 0, we move the path data up by yOffset
function updateYOffsetAndScale (glyph, fontOffset: number, scale: number) {
  const { path } = glyph
  const newPath = []
  let i = 0
  let len = path.length

  while (i < len) {
    if (path[i] === 0) {
      newPath.push(0, Math.round((path[i + 1]) * scale), Math.round((-fontOffset + path[i + 2]) * scale))
      i += 3
    } else if (path[i] === 1) {
      newPath.push(1, Math.round((path[i + 1]) * scale), Math.round((-fontOffset + path[i + 2]) * scale))
      i += 3
    } else if (path[i] === 2) {
      newPath.push(2, Math.round((path[i + 1]) * scale), Math.round((-fontOffset + path[i + 2]) * scale), Math.round((path[i + 3]) * scale), Math.round((-fontOffset + path[i + 4]) * scale), Math.round((path[i + 5]) * scale), Math.round((-fontOffset + path[i + 6]) * scale))
      i += 7
    } else if (path[i] === 3) {
      newPath.push(3, Math.round((path[i + 1]) * scale), Math.round((-fontOffset + path[i + 2]) * scale), Math.round((path[i + 3]) * scale), Math.round((-fontOffset + path[i + 4]) * scale))
      i += 5
    } else if (path[i] === 4) {
      newPath.push(4)
      i++
    }
  }

  glyph.path = newPath
  glyph.advanceWidth = Math.round(glyph.advanceWidth * scale)
  glyph.yMax = Math.round(glyph.yMax * scale)
}

// If the maxY is greater than 1, we update.
function rescaleCode (code: Code): Code {
  const { maxY, path } = code
  // set the scale
  const scale = code.scale = 4096 / maxY

  // run through path and multiply all x and y by scale
  const newPath = []
  let i = 0
  let len = path.length

  while (i < len) {
    if (path[i] === 0) {
      newPath.push(0, Math.round(scale * path[i + 1]), Math.round(scale * path[i + 2]))
      i += 3
    } else if (path[i] === 1) {
      newPath.push(1, Math.round(scale * path[i + 1]), Math.round(scale * path[i + 2]))
      i += 3
    } else if (path[i] === 2) {
      newPath.push(2, Math.round(scale * path[i + 1]), Math.round(scale * path[i + 2]), Math.round(scale * path[i + 3]), Math.round(scale * path[i + 4]), Math.round(scale * path[i + 5]), Math.round(scale * path[i + 6]))
      i += 7
    } else if (path[i] === 3) {
      newPath.push(3, Math.round(scale * path[i + 1]), Math.round(scale * path[i + 2]), Math.round(scale * path[i + 3]), Math.round(scale * path[i + 4]))
      i += 5
    } else if (path[i] === 4) {
      newPath.push(4)
      i++
    }
  }

  code.path = newPath

  return code
}
