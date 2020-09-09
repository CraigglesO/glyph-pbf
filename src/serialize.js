// @flow
import Protobuf from 'pbf'
import { zigzag } from './zigzag'

import type { Glyph, GlyphSetType, KernSet, Kern, Color } from './'

export default function serialize (extent: number, glyphs: Map, kernSet: KernSet, type: GlyphSetType,
  colors?: Array<Color>, billboards?: Array<Billboard>) {
  const out = new Protobuf()
  writeGlyphSet(extent, glyphs, kernSet, type, colors, billboards, out)
  const finish = out.finish()

  return finish
}

function writeGlyphSet (extent: number, glyphs: Map, kernSet: KernSet, type: GlyphSetType, colors?: Array<Color>, billboards?: Array<Billboard>, pbf: Protobuf) {
  // write version
  pbf.writeVarintField(15, 1)
  // write type
  pbf.writeVarintField(14, (type === 'font') ? 0 : 1)
  // write extent
  pbf.writeVarintField(13, extent)
  // write glyphs
  for (const glyph of glyphs) pbf.writeMessage(1, writeGlyph, glyph)
  // kern set
  if (kernSet) for (const kern of kernSet) pbf.writeMessage(2, writeKernings, kern)
  // write colors
  if (colors) for (const color of colors) pbf.writeMessage(3, writeColor, color)
  // write billboards
  if (billboards) for (const billboard of billboards) pbf.writeMessage(4, writeBillboard, billboard)
}

function writeGlyph (glyph: Glyph, pbf: Protobuf) {
  const [unicode, { advanceWidth, yOffset, path }] = glyph

  pbf.writeVarintField(1, unicode)
  if (advanceWidth) pbf.writeVarintField(2, advanceWidth)
  if (yOffset) pbf.writeVarintField(3, yOffset)
  pbf.writeMessage(4, writePath, path)
}

function writeColor (color: Color, pbf: Protobuf) {
  pbf.writeVarintField(1, color.id)
  pbf.writeVarintField(2, color.red)
  pbf.writeVarintField(3, color.green)
  pbf.writeVarintField(4, color.blue)
  pbf.writeVarintField(5, color.alpha)
}

// billboards are a collection of glyph and color pairs to draw
function writeBillboard (billboard: Billboard, pbf: Protobuf) {
  const { name, features } = billboard

  pbf.writeStringField(1, name)
  for (const feature of features) pbf.writeMessage(2, writeFeatures, feature)
}

function writeFeatures (feature: Feature, pbf: Protobuf) {
  const { color, geometry } = feature
  pbf.writeVarintField(1, geometry)
  pbf.writeVarintField(2, color)
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
