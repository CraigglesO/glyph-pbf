// @flow
import Protobuf from 'pbf'
import { zagzig } from './zigzag'

type Path = Array<number> | { vertices: Array<number>, indices: Array<number>, quads: Array<number>, strokes: Array<Array<number>> }

type Point = [number, number]

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
  path: Path
  _path: number
  constructor (pbf: Protobuf, end: number) {
    this._pbf = pbf
    pbf.readFields(this.readGlyph, this, end)
  }

  readGlyph (tag: number, glyph: Glyph, pbf: Protobuf) {
    if (tag === 1) glyph.char = String.fromCharCode(pbf.readVarint())
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
    if (buildPath) return this._buildFill(path)
    else return path
  }

  _buildFill (path: Array<number>): Path {
    const len = path.length
    const vertices = []
    const indices = []
    const quads = []
    const strokes = []
    let stroke = []
    let command, x, y, x1, y1, x0, y0
    let i = 0
    let anchorPos = 0
    let indexPos = -1

    while (i < len) {
      // first get command
      command = path[i++]
      // no matter what, add the vertices and increment indexPos
      if (command === 0 || command === 1) { // MoveTo or LineTo
        // add vertices with polygon-type
        x = path[i++] / 4096
        y = path[i++] / 4096
        vertices.push(x, y, 0)
        stroke.push([x, y])
        indexPos++
      }
      // MoveTo - start a triangle with its first two points
      if (command === 0) {
        anchorPos = indexPos
        indices.push(indexPos, indexPos)
      } else if (command === 1) { // LineTo - finish triangle and setup the next triangles first two points
        // finish a triangle, and start another
        indices.push(indexPos, anchorPos, indexPos)
      } else if (command === 2) { // Cubic Bezier (Not supported)

      } else if (command === 3) { // Quadratic Bezier to
        // first restore x any y as a start-quad type
        vertices.push(x, y, 1)
        indexPos++
        // get the new values
        x0 = x
        y0 = y
        x1 = path[i++] / 4096
        y1 = path[i++] / 4096
        x = path[i++] / 4096
        y = path[i++] / 4096
        // store vertices
        vertices.push(
          x1, y1, 2, // the control point vertices
          x, y, 3, // the end vertices
          x, y, 0 // the next vertices in the polygon
        )
        // the first set of vertices added were the quad
        quads.push(indexPos++, indexPos++, indexPos++)
        // store the next part of the main polygon
        indices.push(indexPos, anchorPos, indexPos)

        // build a stroke path using a few points
        // https://stackoverflow.com/questions/5634460/quadratic-b%C3%A9zier-curve-calculate-points
        for (let v = 0; v <= 6; v++) {
          const t = v / 6
          const subT = 1 - t

          stroke.push([
            subT * subT * x0 + 2 * subT * t * x1 + t * t * x,
            subT * subT * y0 + 2 * subT * t * y1 + t * t * y
          ])
        }
      } else if (command === 4) { // Close - finish the last triangle
        indices.push(anchorPos)
        strokes.push(stroke)
        stroke = []
      }
    }

    return { indices, vertices, quads, strokes }
  }
}
