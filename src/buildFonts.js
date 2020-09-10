// @flow
import fs from 'fs'
import { gzipSync } from 'zlib'
import * as opentype from 'opentype.js'
import commandsToCode from './commandsToCode'
import reduceSize from './reduceSize'
import serialize from './serialize'

import type { Code } from './commandsToCode'

export type Glyph = {
  unitsPerEm: number,
  advanceWidth: number,
  yOffset: numnber,
  path: Array<number>,
  yRange: number
}

export type KernSet = Array<Kern>

export type Kern = {
  from: number,
  to: number,
  amount: number
}

export default function buildFonts (fonts: Array<string>, charset: string, out: string, extent?: number = 1024) {
  // step 1, build a glyph set
  const [glyphMap, kernSet] = buildGlyphSet(fonts, charset, extent)
  // step 2, build the pbf
  const pbf = serialize(extent, glyphMap, kernSet, 'font')
  // step 3, gzip compress and save
  fs.writeFileSync(out, gzipSync(pbf))
}

function buildGlyphSet (fonts: Array<Font>, charset: string, extent: number): Map {
  const kernSet = []
  const glyphMap = new Map()
  const unicodeMap = new Map()
  let fontMinY = Infinity
  if (!charset) charset = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
  charset = new Set(charset)
  for (const font of fonts) {
    // build font data
    const data = opentype.loadSync(font)
    const { unitsPerEm, kerningPairs } = data

    // run through each char in toFindSet, if we find, we add to our glyphMap, otherwise
    for (const char of charset) {
      const glyph = data.charToGlyph(char)
      if (glyph.index !== 0) {
        // we build
        let { index, advanceWidth } = glyph
        const code = commandsToCode(glyph.getPath(0, 0, 1).commands, extent)
        if (!advanceWidth) continue
        const unicode = char.charCodeAt(0)
        const { yOffset, path } = code
        // build out necessary components of glyph
        const bbox = glyph.getBoundingBox()
        let builtGlyph = {
          advanceWidth: Math.round(advanceWidth / unitsPerEm * extent),
          path,
          yOffset: (yOffset < 0) ? -yOffset : 0,
          yRange: [bbox.y1 > 0 ? 0 : bbox.y1 / unitsPerEm, bbox.y2 / unitsPerEm]
        }
        // rescale if necessary
        if (builtGlyph.yRange[1] - builtGlyph.yRange[0] > 1) builtGlyph = rescaleGlyph(builtGlyph)
        // reduce size
        builtGlyph.path = reduceSize(builtGlyph.path)
        // store
        glyphMap.set(unicode, builtGlyph)
        unicodeMap.set(index, unicode)
        // remove char from charset as we have already built it
        charset.delete(char)
      }
    }

    // kerning map
    for (const kernKey in kerningPairs) {
      const [from, to] = kernKey.split(',')
      from = getUnicode(unicodeMap, +from)
      to = getUnicode(unicodeMap, +to)
      if (!from || !to) continue
      const amount = Math.round(kerningPairs[kernKey] / unitsPerEm * extent)
      if (!amount) continue
      kernSet.push({ from, to, amount })
    }
  }

  return [glyphMap, kernSet]
}

function getUnicode (unicodeMap: Set, index: number) {
  if (unicodeMap.has(index)) return unicodeMap.get(index)
}

// If the total size of the glyph exceeds 1, than it is too large.
function rescaleGlyph (glyph: Glyph): Glyph {
  const { path, yRange } = glyph
  const newPath = []
  let i = 0
  let len = path.length

  const scale = 1 / yRange[2] - yRange[1]

  while (i < len) {
    if (path[i] === 0) {
      newPath.push(0, Math.round(path[i + 1] * scale), Math.round(path[i + 2] * scale))
      i += 3
    } else if (path[i] === 1) {
      newPath.push(1, Math.round(path[i + 1] * scale), Math.round(path[i + 2] * scale))
      i += 3
    } else if (path[i] === 2) {
      newPath.push(2, Math.round(path[i + 1] * scale), Math.round(path[i + 2] * scale), Math.round(path[i + 3] * scale), Math.round(path[i + 4] * scale), Math.round(path[i + 5] * scale), Math.round(path[i + 6] * scale))
      i += 7
    } else if (path[i] === 3) {
      newPath.push(3, Math.round(path[i + 1] * scale), Math.round(path[i + 2] * scale), Math.round(path[i + 3] * scale), Math.round(path[i + 4] * scale))
      i += 5
    } else if (path[i] === 4) {
      newPath.push(4)
      i++
    }
  }

  glyph.path = newPath
  glyph.yOffset *= scale

  return glyph
}
