// @flow
import { zigzag } from './zigzag'

export default function reduceSize (code: Array<number>): Array<number> {
  let i = 0
  const len = code.length
  let cmd
  const res = []
  const cursor = { x0: 0, y0: 0, x: 0, y: 0, x1: 0, x2: 0, y2: 0 }

  while (i < len) {
    // get new command
    cmd = code[i++]
    if (cmd === 0) { // MoveTo
      cursor.x = code[i++]
      cursor.y = code[i++]
      const dx = cursor.x - cursor.x0
      const dy = cursor.y - cursor.y0
      const smaller = zigzag(dx) < zigzag(cursor.x) && zigzag(dy) < zigzag(cursor.y)
      if (smaller) res.push(5, dx, dy)
      else res.push(0, cursor.x, cursor.y)
      cursor.x0 = cursor.x
      cursor.y0 = cursor.y
    } else if (cmd === 1) { // LineTo
      cursor.x = code[i++]
      cursor.y = code[i++]
      const dx = cursor.x - cursor.x0
      const dy = cursor.y - cursor.y0
      const smaller = zigzag(dx) < zigzag(cursor.x) && zigzag(dy) < zigzag(cursor.y)
      if (smaller) {
        if (dx === 0) res.push(12, dy) // VerticalTo delta
        else if (dy === 0) res.push(10, dx) // horizontalTo delta
        else res.push(6, dx, dy) // LineTo delta
      } else {
        if (dx === 0) res.push(11, cursor.y) // VerticalTo
        else if (dy === 0) res.push(9, cursor.x) // horizontalTo
        else res.push(1, cursor.x, cursor.y) // LineTo
      }
      cursor.x0 = cursor.x
      cursor.y0 = cursor.y
    } else if (cmd === 2) { // cubicBezierTo
      cursor.x1 = code[i++]
      cursor.y1 = code[i++]
      cursor.x2 = code[i++]
      cursor.y2 = code[i++]
      cursor.x = code[i++]
      cursor.y = code[i++]
      const dx1 = cursor.x1 - cursor.x0
      const dy1 = cursor.y1 - cursor.y0
      const dx2 = cursor.x2 - cursor.x0
      const dy2 = cursor.y2 - cursor.y0
      const dx = cursor.x - cursor.x0
      const dy = cursor.y - cursor.y0
      // const smaller = zigzag(dx) < zigzag(cursor.x) && zigzag(dy) < zigzag(cursor.y)
      // if (smaller) res.push(7, dx1, dy1, dx2, dy2, dx, dy)
      // else res.push(2, cursor.x1, cursor.y1, cursor.x2, cursor.y2, cursor.x, cursor.y)
      res.push(2, cursor.x1, cursor.y1, cursor.x2, cursor.y2, cursor.x, cursor.y)
      cursor.x0 = cursor.x
      cursor.y0 = cursor.y
    } else if (cmd === 3) { // quadraticBezierTo
      cursor.x1 = code[i++]
      cursor.y1 = code[i++]
      cursor.x = code[i++]
      cursor.y = code[i++]
      const dx1 = cursor.x1 - cursor.x0
      const dy1 = cursor.y1 - cursor.y0
      const dx = cursor.x - cursor.x0
      const dy = cursor.y - cursor.y0
      // const smaller = zigzag(dx) < zigzag(cursor.x) && zigzag(dy) < zigzag(cursor.y)
      // if (smaller) res.push(8, dx1, dy1, dx, dy)
      // else res.push(3, cursor.x1, cursor.y1, cursor.x, cursor.y)
      res.push(3, cursor.x1, cursor.y1, cursor.x, cursor.y)
      cursor.x0 = cursor.x
      cursor.y0 = cursor.y
    } else if (cmd === 4) { // close
      res.push(4)
    } else if (cmd === 5) { // moveTo delta
      cursor.x = code[i++]
      cursor.y = code[i++]
      res.push(5, cursor.x, cursor.y)
      cursor.x0 += cursor.x
      cursor.y0 += cursor.y
    } else if (cmd === 6) { // lineTo delta
      cursor.x = code[i++]
      cursor.y = code[i++]
      res.push(6, cursor.x, cursor.y)
      cursor.x0 += cursor.x
      cursor.y0 += cursor.y
    } else if (cmd === 7) { // cubicBezierTo delta
      cursor.x1 = code[i++]
      cursor.y1 = code[i++]
      cursor.x2 = code[i++]
      cursor.y2 = code[i++]
      cursor.x = code[i++]
      cursor.y = code[i++]
      res.push(7, cursor.x1, cursor.y1, cursor.x2, cursor.y2, cursor.x, cursor.y)
      cursor.x0 += cursor.x
      cursor.y0 += cursor.y
    } else if (cmd === 8) { // quadraticBezierTo delta
      cursor.x1 = code[i++]
      cursor.y1 = code[i++]
      cursor.x = code[i++]
      cursor.y = code[i++]
      res.push(8, cursor.x1, cursor.y1, cursor.x, cursor.y)
      cursor.x0 += cursor.x
      cursor.y0 += cursor.y
    } else if (cmd === 9) { // horizontalTo
      cursor.x = code[i++]
      res.push(9, cursor.x)
      cursor.x0 = cursor.x
    } else if (cmd === 10) { // horizontalTo delta
      cursor.x = code[i++]
      res.push(10, cursor.x)
      cursor.x0 += cursor.x
    } else if (cmd === 11) { // VerticalTo
      cursor.y = code[i++]
      res.push(11, cursor.y)
      cursor.y0 = cursor.y
    } else if (cmd === 12) { // VerticalTo delta
      cursor.y = code[i++]
      res.push(12, cursor.y)
      cursor.y0 += cursor.y
    } else if (cmd === 13) { // partialCubicBezierTo
      cursor.x2 = code[i++]
      cursor.y2 = code[i++]
      cursor.x = code[i++]
      cursor.y = code[i++]
      res.push(13, cursor.x2, cursor.y2, cursor.x, cursor.y)
      cursor.x0 = cursor.x
      cursor.y0 = cursor.y
    } else if (cmd === 14) { // partialCubicBezierTo delta
      cursor.x2 = code[i++]
      cursor.y2 = code[i++]
      cursor.x = code[i++]
      cursor.y = code[i++]
      res.push(14, cursor.x2, cursor.y2, cursor.x, cursor.y)
      cursor.x0 += cursor.x
      cursor.y0 += cursor.y
    } else if (cmd === 15) { // partialQuadraticBezierTo
      cursor.x = code[i++]
      cursor.y = code[i++]
      res.push(15, cursor.x, cursor.y)
      cursor.x0 = cursor.x
      cursor.y0 = cursor.y
    } else if (cmd === 16) { // partialQuadraticBezierTo delta
      cursor.x = code[i++]
      cursor.y = code[i++]
      res.push(16, cursor.x, cursor.y)
      cursor.x0 += cursor.x
      cursor.y0 += cursor.y
    }
  }

  return res
}
