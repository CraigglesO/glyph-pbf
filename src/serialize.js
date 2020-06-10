// @flow
import Protobuf from 'pbf'
import { zigzag } from './zigzag'

import type { Glyph, KernSet, Kern } from './'

export default function serialize (glyphs: Map, kernSet: KernSet) {
  const out = new Protobuf()
  writeGlyphs(glyphs, kernSet, out)
  const finish = out.finish()

  return finish
}

function writeGlyphs (glyphs: Map, kernSet: KernSet, pbf: Protobuf) {
  // write version
  pbf.writeVarintField(15, 1)
  // write glyphs
  for (const glyph of glyphs) pbf.writeMessage(1, writeGlyph, glyph)
  // kern set
  for (const kern of kernSet) pbf.writeMessage(2, writeKernings, kern)
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

function writeKernings (kern: Kern, pbf: Protobuf) {
  const { from, to, amount } = kern

  pbf.writeVarintField(1, from)
  pbf.writeVarintField(2, to)
  pbf.writeVarintField(3, zigzag(amount))
}
