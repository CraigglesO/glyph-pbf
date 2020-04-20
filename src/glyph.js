// @flow
import Protobuf from 'pbf'
import { zagzig } from './zigzag'

type Path = Array<number> | { vertices: Array<number>, indices: Array<number>, quads: Array<number> }

export default class Glyph {
  unicode: number
  advanceWidth: number
  path: Path
  _path: number
  constructor (pbf: Protobuf, end: number) {
    this._pbf = pbf
    pbf.readFields(this.readGlyph, this, end)
  }

  readGlyph (tag: number, glyph: Glyph, pbf: Protobuf) {
    if (tag === 1) glyph.unicode = pbf.readVarint()
    else if (tag === 2) glyph.advanceWidth = pbf.readVarint() / 4096
    else if (tag === 3) glyph._path = pbf.pos
  }

  getPath (buildPath: boolean = true): Path {
    // set position
    this._pbf.pos = this._path
    // find end
    const end = this._pbf.readVarint() + this._pbf.pos
    // prep path object
    const path = []
    // get path code
    while (this._pbf.pos < end) path.push(zagzig(this._pbf.readVarint()))
    // if build, design a polygon, otherwise keep the commands
    if (buildPath && path.length) return this._buildPath(path)
    else return path
  }

  _buildPath (path: Array<number>): { vertices: Array<number>, indices: Array<number>, quads: Array<number> } {
    const len = path.length
    const vertices = []
    const indices = []
    const quads = []
    let command, x, y, x1, y1
    let i = 0
    let anchorPos = 0
    let indexPos = -1

    while (i < len) {
      // first get command
      command = path[i++]
      // no matter what, add the vertices and increment indexPos
      if (command === 0 || command === 1) { // MoveTo or LineTo
        // add vertices
        vertices.push(path[i++] / 4096, path[i++] / 4096)
        indexPos++
      }
      // MoveTo - start a triangle with its first two points
      if (command === 0) {
        anchorPos = indexPos
        indices.push(indexPos, indexPos)
      } else if (command === 1) { // LineTo - finish triangle and setup the next triangles first two points
        // finish a triangle, and start another
        indices.push(indexPos, anchorPos, indexPos)
      } else if (command === 3) { // Quadratic Bezier to
        // store vertices
        vertices.push(path[i++] / 4096, path[i++] / 4096, path[i++] / 4096, path[i++] / 4096)
        // store the quad
        quads.push(indexPos++, indexPos++, indexPos)
        // store the next part of the main polygon
        indices.push(indexPos, anchorPos, indexPos)
      } else if (command === 4) { // Close - finish the last triangle
        indices.push(anchorPos)
      }
    }

    return { indices, vertices, quads }
  }
}
