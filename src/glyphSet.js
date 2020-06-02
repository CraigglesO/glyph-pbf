// @flow
import Protobuf from 'pbf'
import Glyph from './glyph'
import { zagzig } from './zigzag'

import type { KernSet, Kern } from './'

export default class GlyphSet extends Map {
  version: number
  kerningPairs: KernSet = {}
  constructor (data: Buffer, end?: number = 0) {
    super()
    this._buildGlyphs(data, end)
  }

  _buildGlyphs (buffer: Buffer, end: number) {
    const pbf = new Protobuf(buffer)
    pbf.readFields(this.readGlyphs, this, end)
  }

  readGlyphs (tag: number, glyphSet: GlyphSet, pbf: Protobuf) {
    if (tag === 15) {
      glyphSet.version = pbf.readVarint()
    } else if (tag === 1) {
      const glyph: Glyph = new Glyph(pbf, pbf.readVarint() + pbf.pos)
      glyphSet.set(glyph.char, glyph)
    } else if (tag === 2) {
      // TODO: Re-add kerning when it matters
      // const kerning: Kern = {}
      // pbf.readFields(readKerningPairs, kerning, pbf.readVarint() + pbf.pos)
      // const { from, to, amount } = kerning
      // if (!glyphSet.kerningPairs[from]) glyphSet.kerningPairs[from] = {}
      // glyphSet.kerningPairs[from][to] = amount
    }
  }

  getKernPair (from: number, to: number): number {
    const _from = this.kerningPairs[from]
    return (_from && _from[to]) ? _from[to] : 0
  }
}

// function readKerningPairs (tag: number, kerning: Kern, pbf: Protobuf) {
//   if (tag === 1) kerning.from = pbf.readVarint()
//   else if (tag === 2) kerning.to = pbf.readVarint()
//   else if (tag === 3) kerning.amount = zagzig(pbf.readVarint()) / 4096
// }
