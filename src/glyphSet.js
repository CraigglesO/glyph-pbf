// @flow
import Protobuf from 'pbf'
import Glyph from './glyph'

export default class GlyphSet extends Map {
  version: number
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
      glyphSet.set(glyph.unicode, glyph)
    }
  }
}
