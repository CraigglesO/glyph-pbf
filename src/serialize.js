// @flow
import Protobuf from 'pbf'
import { zigzag } from './zigzag'

import type { Glyph } from './'

export default function serialize (glyphs: Map) {
  const out = new Protobuf()
  writeGlyphs(glyphs, out)
  const finish = out.finish()

  return finish
}

function writeGlyphs (glyphs: Array<Glyph>, pbf: Protobuf) {
  // write version
  pbf.writeVarintField(15, 1)
  // write glyphs
  for (let glyph of glyphs) pbf.writeMessage(1, writeGlyph, glyph)
}

function writeGlyph (glyph: Glyph, pbf: Protobuf) {
  const [unicode, { advanceWidth, path }] = glyph

  pbf.writeVarintField(1, unicode)
  pbf.writeVarintField(2, advanceWidth)
  pbf.writeMessage(3, writePath, path)
}

function writePath (path: Array<number>, pbf: Protobuf) {
  for (const num of path) pbf.writeVarint(zigzag(num))
}
