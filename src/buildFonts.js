// @flow
import fs from 'fs'
import { gzipSync } from 'zlib'
import * as opentype from 'opentype.js'
import serialize from './serialize'

export type Glyph = {
  advanceWidth: number,
  path: Array<number>
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
  const glyphMap = buildGlyphSet(fonts)
  // step 2, build the pbf
  const pbf = serialize(glyphMap)
  // step 3, gzip compress and save
  fs.writeFileSync(out, gzipSync(pbf))
}

function buildGlyphSet (fonts: Array<Font>): Map {
  const map = new Map()
  for (const font of fonts) {
    const { unitsPerEm, glyphs } = font
    for (const key in glyphs.glyphs) {
      const glyph = glyphs.glyphs[key]
      const { unicode, advanceWidth } = glyph
      if (unicode && !map.has(unicode)) {
        const path = commandsToCode(glyph.getPath(0, 0, 1).commands)
        map.set(unicode, {
          advanceWidth: Math.round(advanceWidth / unitsPerEm * 4096),
          path: commandsToCode(glyph.getPath(0, 0, 1).commands)
        })
      }
    }
  }

  return map
}

function commandsToCode (commands: Array<Command>) {
  let prevX, prevY, add
  return commands.flatMap(command => {
    const { type, x, y, x1, y1, x2, y2 } = command
    add = x === prevX && y === prevY
    prevX = x
    prevY = y
    if (type === 'M') { // Move to
      return [0, Math.round(x * 4096), Math.round(-y * 4096)]
    } else if (type === 'L') { // Line to
      if (add) return []
      return [1, Math.round(x * 4096), Math.round(-y * 4096)]
    } else if (type === 'C') { // Cubic Bezier
      if (add) return []
      return [2, Math.round(x2 * 4096), Math.round(-y2 * 4096), Math.round(x1 * 4096), Math.round(-y1 * 4096), Math.round(x * 4096), Math.round(-y * 4096)]
    } else if (type === 'Q') { // Quadratic Bezier
      if (add) return []
      return [3, Math.round(x1 * 4096), Math.round(-y1 * 4096), Math.round(x * 4096), Math.round(-y * 4096)]
    } else if (type === 'Z') { // finish
      return [4]
    }
  })
}
