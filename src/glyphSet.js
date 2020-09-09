// @flow
import Protobuf from 'pbf'
import Glyph from './glyph'
import { zagzig } from './zigzag'

import type { KernSet, Kern, Color } from './'

export type Feature = {
  glyphID: number,
  colorID: number
}

export type Billboard = {
  name: string,
  features: Array<Feature>
}

export type GlyphSetType = 'font' | 'billboard'

export default class GlyphSet extends Map {
  version: number
  extent: number
  type: GlyphSetType
  kerningPairs: KernSet = {}
  constructor (data: Buffer, end?: number = 0) {
    super()
    this._buildGlyphs(data, end)
  }

  _buildGlyphs (buffer: Buffer, end: number) {
    const pbf = new Protobuf(buffer)
    pbf.readFields(this.readGlyphSet, this, end)
  }

  readGlyphSet (tag: number, glyphSet: GlyphSet, pbf: Protobuf) {
    if (tag === 15) {
      glyphSet.version = pbf.readVarint()
    } else if (tag === 14) {
      const type = pbf.readVarint()
      glyphSet.type = (type === 0) ? 'font' : 'billboard'
    } else if (tag === 13) {
      glyphSet.extent = pbf.readVarint()
    } else if (tag === 1) {
      const glyph: Glyph = new Glyph(pbf, glyphSet.extent, pbf.readVarint() + pbf.pos)
      if (glyphSet.type === 'font') glyphSet.set(String.fromCharCode(glyph.char), glyph)
      else glyphSet.set('' + glyph.char, glyph)
    } else if (tag === 2) {
      // TODO: Re-add kerning when it matters
      // const kerning: Kern = {}
      // pbf.readFields(readKerningPairs, kerning, glyphSet.extent, pbf.readVarint() + pbf.pos)
      // const { from, to, amount } = kerning
      // if (!glyphSet.kerningPairs[from]) glyphSet.kerningPairs[from] = {}
      // glyphSet.kerningPairs[from][to] = amount
    } else if (tag === 3) {
      // color
      const color: Color = {}
      pbf.readFields(readColor, color, pbf.readVarint() + pbf.pos)
      glyphSet.set(color.id, [color.red / 255, color.green / 255, color.blue / 255, color.alpha / 255])
    } else if (tag === 4) {
      // billboard
      const billboard: Billboard = { features: [] }
      pbf.readFields(readBillboard, billboard, pbf.readVarint() + pbf.pos)
      glyphSet.set(billboard.name, billboard)
    }
  }

  getKernPair (from: number, to: number): number {
    const _from = this.kerningPairs[from]
    return (_from && _from[to]) ? _from[to] : 0
  }
}

function readColor (tag: number, color: Color, pbf: Protobuf) {
  if (tag === 1) color.id = pbf.readVarint()
  else if (tag === 2) color.red = pbf.readVarint()
  else if (tag === 3) color.green = pbf.readVarint()
  else if (tag === 4) color.blue = pbf.readVarint()
  else if (tag === 5) color.alpha = pbf.readVarint()
}

function readBillboard (tag: number, billboard: Billboard, pbf: Protobuf) {
  if (tag === 1) {
    billboard.name = pbf.readString()
  } else if (tag === 2) {
    const feature: Feature = {}
    pbf.readFields(readFeature, feature, pbf.readVarint() + pbf.pos)
    billboard.features.push(feature)
  }
}

function readFeature (tag: number, feature: Feature, pbf: Protobuf) {
  if (tag === 1) feature.glyphID = pbf.readVarint()
  if (tag === 2) feature.colorID = pbf.readVarint()
}

// function readKerningPairs (tag: number, kerning: Kern, extent: number, pbf: Protobuf) {
//   if (tag === 1) kerning.from = pbf.readVarint()
//   else if (tag === 2) kerning.to = pbf.readVarint()
//   else if (tag === 3) kerning.amount = zagzig(pbf.readVarint()) / extent
// }
