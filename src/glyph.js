// @flow
import Protobuf from 'pbf'
import { zagzig } from './zigzag'
import buildSDF from './buildSDF'

import type { Path } from './buildSDF'
/**
Since we are drawing quads, there are 4 types
polygons are all defined by type 0: [0, 1]
the start of a quad is defined by type 1: [0, 0]
the middle of a quad is defined by type 2: [0.5, 0]
the end of a quad is defined by type 3: [1, 1]
**/

export default class Glyph {
  char: string
  advanceWidth: number
  yOffset: number = 0
  _path: number
  _pbf: Protobuf
  extent: number
  constructor (pbf: Protobuf, extent: number, end: number) {
    this._pbf = pbf
    this.extent = extent
    pbf.readFields(this.readGlyph, this, end)
  }

  readGlyph (tag: number, glyph: Glyph, pbf: Protobuf) {
    if (tag === 1) glyph.char = pbf.readVarint()
    else if (tag === 2) glyph.advanceWidth = pbf.readVarint() / glyph.extent
    else if (tag === 3) glyph.yOffset = pbf.readVarint() / glyph.extent
    else if (tag === 4) glyph._path = pbf.pos
  }

  getPath (buildPath: boolean = true, offset?: [number, number] = [0, 0],
    scale?: number = 34, lineWidth?: number = 4): Path {
    // set position
    this._pbf.pos = this._path
    // find end
    const end = this._pbf.readVarint() + this._pbf.pos
    // prep path object & get path code
    const path = []
    while (this._pbf.pos < end) path.push(zagzig(this._pbf.readVarint()))
    // if build, design a polygon, otherwise keep the commands
    if (buildPath) return buildSDF(path, offset, scale, lineWidth, this.extent)
    else return path
  }
}
