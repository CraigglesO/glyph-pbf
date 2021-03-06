// @flow
import Protobuf from 'pbf'
import { zigzag } from './zigzag'

import type { Glyph, GlyphSetType, KernSet, Kern, Color } from './'

export type Settings = {
  extent: number,
  glyphSize: number,
  sdfMaxSize: number
}

export default function serialize (settings: Settings, glyphs: Map, kernSet: KernSet, type: GlyphSetType,
  colors?: Array<Color>, icons?: Array<Icon>) {
  const out = new Protobuf()
  writeGlyphSet(settings, glyphs, kernSet, type, colors, icons, out)
  const finish = out.finish()

  return finish
}

function writeGlyphSet (settings: Settings, glyphs: Map, kernSet: KernSet, type: GlyphSetType, colors?: Array<Color>, icons?: Array<Icon>, pbf: Protobuf) {
  const { extent, glyphSize, sdfMaxSize } = settings
  // write version
  pbf.writeVarintField(15, 1)
  // write type
  pbf.writeVarintField(14, (type === 'font') ? 0 : 1)
  // write extent
  if (extent) pbf.writeVarintField(13, extent)
  // write glyphSize
  if (glyphSize) pbf.writeVarintField(12, glyphSize)
  // write glyphSize
  if (sdfMaxSize) pbf.writeVarintField(11, sdfMaxSize)
  // write glyphs
  for (const glyph of glyphs) pbf.writeMessage(1, writeGlyph, glyph)
  // kern set
  if (kernSet) for (const kern of kernSet) pbf.writeMessage(2, writeKernings, kern)
  // write colors
  if (colors) for (const color of colors) pbf.writeMessage(3, writeColor, color)
  // write icons
  if (icons) for (const icon of icons) pbf.writeMessage(4, writeIcon, icon)
}

function writeGlyph (glyph: Glyph, pbf: Protobuf) {
  const [unicode, { advanceWidth, yOffset, path, ratio }] = glyph

  pbf.writeVarintField(1, unicode)
  if (advanceWidth) pbf.writeVarintField(2, advanceWidth)
  if (yOffset) pbf.writeVarintField(3, yOffset)
  pbf.writeMessage(4, writePath, path)
  // incase a icon, the glyph needs a width-to-height ratio to properly build its shape
  if (ratio) pbf.writeFloatField(5, ratio)
}

function writeColor (color: Color, pbf: Protobuf) {
  pbf.writeVarintField(1, color.id)
  pbf.writeVarintField(2, color.red)
  pbf.writeVarintField(3, color.green)
  pbf.writeVarintField(4, color.blue)
  pbf.writeVarintField(5, color.alpha)
}

// icons are a collection of glyph and color pairs to draw
function writeIcon (icon: Icon, pbf: Protobuf) {
  const { name, features } = icon

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
