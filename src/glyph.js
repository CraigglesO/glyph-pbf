// @flow
import Protobuf from 'pbf'
import { fromLine } from './parabola'
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
  yOffset: number = 0
  path: Path
  _path: number
  constructor (pbf: Protobuf, end: number) {
    this._pbf = pbf
    pbf.readFields(this.readGlyph, this, end)
  }

  readGlyph (tag: number, glyph: Glyph, pbf: Protobuf) {
    if (tag === 1) glyph.char = String.fromCharCode(pbf.readVarint())
    else if (tag === 2) glyph.advanceWidth = pbf.readVarint() / 4096
    else if (tag === 3) glyph.yOffset = pbf.readVarint() / 4096
    else if (tag === 4) glyph._path = pbf.pos
  }

  getPath (buildPath: boolean = true, offset?: [number, number] = [0, 0],
    scale?: number = 34, lineWidth?: number = 4): Path {
    // set position
    this._pbf.pos = this._path
    // find end
    const end = this._pbf.readVarint() + this._pbf.pos
    // prep path object
    const path = []
    // get path code
    while (this._pbf.pos < end) path.push(zagzig(this._pbf.readVarint()))
    // if build, design a polygon, otherwise keep the commands
    if (buildPath) return this._buildSDF(path, offset, scale, lineWidth)
    else return path
  }

  _buildSDF (path: Array<number>, offset: [number, number], scale: number,
    lineWidth: number): Path {
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
        if (x0 !== undefined && y0 !== undefined && (x0 !== x || y0 !== y)) {
          stroke.push(
            ...fromLine(
              [x0 * scale + offset[0] + lineWidth, y0 * scale + offset[1] + lineWidth],
              [x * scale + offset[0] + lineWidth, y * scale + offset[1] + lineWidth],
              lineWidth
            )
          )
        }
        x0 = x
        y0 = y
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
        let xPrev = x0
        let yPrev = y0
        let xCurr, yCurr
        for (let v = 1; v <= 6; v++) {
          const t = v / 6
          const subT = 1 - t

          xCurr = subT * subT * x0 + 2 * subT * t * x1 + t * t * x
          yCurr = subT * subT * y0 + 2 * subT * t * y1 + t * t * y
          if (xPrev && yPrev && (xPrev !== x || yPrev !== y)) {
            stroke.push(
              ...fromLine(
                [xPrev * scale + offset[0] + lineWidth, yPrev * scale + offset[1] + lineWidth],
                [xCurr * scale + offset[0] + lineWidth, yCurr * scale + offset[1] + lineWidth],
                lineWidth
              )
            )
          }
          xPrev = xCurr
          yPrev = yCurr
        }
        // update new starter points
        x0 = x
        y0 = y
      } else if (command === 4) { // Close - finish the last triangle
        indices.push(anchorPos)
        strokes.push(stroke)
        stroke = []
        x0 = null
        y0 = null
      }
    }

    return { indices, vertices, quads, strokes }
  }
}
