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

export default function buildFonts (fonts: Array<string>, out: string) {
  // prelude: build fonts
  fonts = fonts.map(font => opentype.loadSync(font))
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
  for (const font of fonts) {
    const { unitsPerEm, glyphs, ascender, descender, kerningPairs } = font
    // glyph map
    for (const key in glyphs.glyphs) {
      const glyph = glyphs.glyphs[key]
      const { unicode, index, advanceWidth } = glyph
      if (unicode && !glyphMap.has(unicode)) {
        const [yOffset, path] = commandsToCode(glyph.getPath(0, 0, 1).commands)
        glyphMap.set(unicode, {
          advanceWidth: Math.round(advanceWidth / unitsPerEm * 4096),
          yOffset,
          path
        })
        unicodeMap.set(index, unicode)
      }
    }
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

function commandsToCode (commands: Array<Command>): [number, Array<number>] {
  let prevX, prevY, add
  let yOffset = Infinity
  const path = []
  commands.forEach(command => {
    const { type, x, y, x1, y1, x2, y2 } = command
    add = x === prevX && y === prevY
    prevX = x
    prevY = y
    if (type !== 'Z') yOffset = Math.min(yOffset, Math.round(-y * 4096))
    if (type === 'M') { // Move to
      path.push(0, Math.round(x * 4096), Math.round(-y * 4096))
    } else if (type === 'L') { // Line to
      if (!add) path.push(1, Math.round(x * 4096), Math.round(-y * 4096))
    } else if (type === 'C') { // Cubic Bezier
      if (!add) path.push(1, Math.round(x2 * 4096), Math.round(-y2 * 4096), Math.round(x1 * 4096), Math.round(-y1 * 4096), Math.round(x * 4096), Math.round(-y * 4096))
    } else if (type === 'Q') { // Quadratic Bezier
      if (!add) path.push(3, Math.round(x1 * 4096), Math.round(-y1 * 4096), Math.round(x * 4096), Math.round(-y * 4096))
    } else if (type === 'Z') { // finish
      path.push(4)
    }
  })

  return [yOffset, path]
}
