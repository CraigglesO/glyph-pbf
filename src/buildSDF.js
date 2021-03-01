// @flow
import cubicToQuadratic from './cubicToQuadratic'
import { fromLine } from './parabola'

export type Path = Array<number> | { vertices: Array<number>, indices: Array<number>, quads: Array<number>, strokes: Array<Array<number>> }

type Cursor = {
  x0: number, // current position X
  y0: number, // current position Y
  x: number, // end position X
  y: number, // end position Y
  x1: number, // control position 1 X
  y1: number, // control position 1 Y
  x2: number, // control position 2 X
  y2: number, // control position 2 Y
  anchor: number,
  indexPos: number,
  lineWidth: number
}

export default function buildSDF (glyph: Array<number>, offset: [number, number],
  scale: number, lineWidth: number, extent: number, ratio: number): Path {
  // prep data containers
  const res: Path = { vertices: [], indices: [], quads: [], strokes: [] }
  // get length and prep variables
  let len = glyph.length
  const cursor: Cursor = { x0: 0, y0: 0, x: 0, y: 0, x1: 0, y1: 0, x2: 0, y2: 0, anchor: 0, indexPos: -1, lineWidth }
  let i = 0
  let cmd, ux0 = 0, uy0 = 0, ax = 0, ay = 0 // unmodifiedX0, unmodifiedY0, anchorX, anchorY

  while (i < len) {
    // get new command
    cmd = glyph[i++]
    // condition based parsing
    if (cmd === 0) { // moveTo
      ux0 = glyph[i++]
      uy0 = glyph[i++]
      cursor.x0 = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y0 = uy0 / extent * scale + offset[1] + lineWidth
      ax = cursor.x0
      ay = cursor.y0
      res.vertices.push(ax, ay, 0)
      cursor.anchor = ++cursor.indexPos
    } else if (cmd === 1) { // lineTo
      ux0 = glyph[i++]
      uy0 = glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _lineTo(cursor, res)
    } else if (cmd === 2) { // cubicBezierTo
      cursor.x1 = glyph[i++] / extent * ratio * scale + offset[0] + lineWidth
      cursor.y1 = glyph[i++] / extent * scale + offset[1] + lineWidth
      cursor.x2 = glyph[i++] / extent * ratio * scale + offset[0] + lineWidth
      cursor.y2 = glyph[i++] / extent * scale + offset[1] + lineWidth
      ux0 = glyph[i++]
      uy0 = glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _cubicTo(cursor, res)
    } else if (cmd === 3) { // quadraticBezierTo
      cursor.x1 = glyph[i++] / extent * ratio * scale + offset[0] + lineWidth
      cursor.y1 = glyph[i++] / extent * scale + offset[1] + lineWidth
      ux0 = glyph[i++]
      uy0 = glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _quadraticTo(cursor, res)
    } else if (cmd === 4) { // Close
      // store a final "lineTo" stroke
      res.strokes.push(...fromLine([cursor.x0, cursor.y0], [ax, ay], lineWidth))
    } else if (cmd === 5) { // moveTo delta
      ux0 += glyph[i++]
      uy0 += glyph[i++]
      cursor.x0 = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y0 = uy0 / extent * scale + offset[1] + lineWidth
      ax = cursor.x0
      ay = cursor.y0
      res.vertices.push(ax, ay, 0)
      cursor.anchor = ++cursor.indexPos
    } else if (cmd === 6) { // lineTo delta
      ux0 += glyph[i++]
      uy0 += glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _lineTo(cursor, res)
    } else if (cmd === 7) { // cubicBezierTo delta
      cursor.x1 = (ux0 + glyph[i++]) / extent * ratio * scale + offset[0] + lineWidth
      cursor.y1 = (uy0 + glyph[i++]) / extent * scale + offset[1] + lineWidth
      cursor.x2 = (ux0 + glyph[i++]) / extent * ratio * scale + offset[0] + lineWidth
      cursor.y2 = (uy0 + glyph[i++]) / extent * scale + offset[1] + lineWidth
      ux0 += glyph[i++]
      uy0 += glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _cubicTo(cursor, res)
    } else if (cmd === 8) { // quadraticBezierTo delta
      cursor.x1 = (ux0 + glyph[i++]) / extent * ratio * scale + offset[0] + lineWidth
      cursor.y1 = (uy0 + glyph[i++]) / extent * scale + offset[1] + lineWidth
      ux0 += glyph[i++]
      uy0 += glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _quadraticTo(cursor, res)
    } else if (cmd === 9) { // horizontalTo
      ux0 = glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = cursor.y0
      _lineTo(cursor, res)
    } else if (cmd === 10) { // horizontalTo delta
      ux0 += glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = cursor.y0
      _lineTo(cursor, res)
    } else if (cmd === 11) { // VerticalTo
      uy0 = glyph[i++]
      cursor.x = cursor.x0
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _lineTo(cursor, res)
    } else if (cmd === 12) { // VerticalTo delta
      uy0 += glyph[i++]
      cursor.x = cursor.x0
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _lineTo(cursor, res)
    } else if (cmd === 13) { // (S) partialCubicBezierTo
      cursor.x1 = cursor.x0 + (cursor.x0 - cursor.x1)
      cursor.y1 = cursor.y0 + (cursor.y0 - cursor.y1)
      cursor.x2 = glyph[i++] / extent * ratio * scale + offset[0] + lineWidth
      cursor.y2 = glyph[i++] / extent * scale + offset[1] + lineWidth
      ux0 = glyph[i++]
      uy0 = glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _cubicTo(cursor, res)
    } else if (cmd === 14) { // (s) partialCubicBezierTo delta
      cursor.x1 = cursor.x0 + (cursor.x0 - cursor.x1)
      cursor.y1 = cursor.y0 + (cursor.y0 - cursor.y1)
      cursor.x2 = (ux0 + glyph[i++]) / extent * ratio * scale + offset[0] + lineWidth
      cursor.y2 = (uy0 + glyph[i++]) / extent * scale + offset[1] + lineWidth
      ux0 += glyph[i++]
      uy0 += glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _cubicTo(cursor, res)
    } else if (cmd === 15) { // (T) partialQuadraticBezierTo
      cursor.x1 = cursor.x0 + (cursor.x0 - cursor.x1)
      cursor.y1 = cursor.y0 + (cursor.y0 - cursor.y1)
      ux0 = glyph[i++]
      uy0 = glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _quadraticTo(cursor, res)
    } else if (cmd === 16) { // (t) partialQuadraticBezierTo delta
      cursor.x1 = cursor.x0 + (cursor.x0 - cursor.x1)
      cursor.y1 = cursor.y0 + (cursor.y0 - cursor.y1)
      ux0 += glyph[i++]
      uy0 += glyph[i++]
      cursor.x = ux0 / extent * ratio * scale + offset[0] + lineWidth
      cursor.y = uy0 / extent * scale + offset[1] + lineWidth
      _quadraticTo(cursor, res)
    }
  }

  return res
}

function _lineTo (cursor: Cursor, res: Path) {
  // grab constants
  const { x0, y0, x, y, lineWidth, anchor } = cursor
  const { vertices, indices, strokes } = res
  // store vertices
  vertices.push(x, y, 0)
  // store stroke
  strokes.push(...fromLine([x0, y0], [x, y], lineWidth))
  // store indices, increment index to currentPos
  indices.push(anchor, cursor.indexPos++, cursor.indexPos)
  // update current to end
  cursor.x0 = x
  cursor.y0 = y
}

function _cubicTo (cursor: Cursor, res: Path) {
  // grab constants
  const { x0, y0, x1, y1, x2, y2, x, y } = cursor
  // convert to 4 quadratics, rebuild array with new data, and rewind
  const quadratics = cubicToQuadratic([x0, y0], [x1, y1], [x2, y2], [x, y])
  for (const quadratic of quadratics) {
    cursor.x1 = quadratic[0]
    cursor.y1 = quadratic[1]
    cursor.x = quadratic[2]
    cursor.y = quadratic[3]
    _quadraticTo(cursor, res)
  }
}

function _quadraticTo (cursor: Cursor, res: Path) {
  // grab constants
  const { x0, y0, x1, y1, x, y, anchor, lineWidth } = cursor
  const { vertices, indices, quads, strokes } = res
  // store all vertex types: start quad, control point, end quad, end vertex
  vertices.push(
    x0, y0, 1, // start quadratic
    x1, y1, 2, // control point
    x, y, 3, // end quadratic
    x, y, 0 // end lineTo
  )
  // store the lineTo
  indices.push(anchor, cursor.indexPos++, cursor.indexPos + 3)
  // the quad set
  quads.push(cursor.indexPos++, cursor.indexPos++, cursor.indexPos++)
  // build the stroke using a few points
  // https://stackoverflow.com/questions/5634460/quadratic-b%C3%A9zier-curve-calculate-points
  let xPrev = x0
  let yPrev = y0
  let xCurr, yCurr
  for (let v = 1; v <= 4; v++) {
    const t = v / 4
    const subT = 1 - t

    xCurr = subT * subT * x0 + 2 * subT * t * x1 + t * t * x
    yCurr = subT * subT * y0 + 2 * subT * t * y1 + t * t * y
    strokes.push(...fromLine([xPrev, yPrev], [xCurr, yCurr], lineWidth))
    xPrev = xCurr
    yPrev = yCurr
  }
  // update current to end
  cursor.x0 = x
  cursor.y0 = y
}
