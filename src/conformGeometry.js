// @flow
import type { Geometry, Command } from './'

// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// convert to each instruction as an object.
export default function conformGeometry (geo: Geometry): Array<Command> {
  // const { cmd, x, y, x1, y1, x2, y2, rx, ry, xar, laf, sf } = command
  const { width, height } = geo
  const instrct = geo.instructions
  let i = 0
  const len = instrct.length
  const result = []

  while (i < len) {
    const cmd = instrct[i++]
    if (cmd === 'M') { // Move to
      result.push({ type: 'M', x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'L') { // Line to
      result.push({ type: 'L', x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'C') { // Cubic Bezier
      result.push({ type: 'C', x1: instrct[i++] / width, y1: instrct[i++] / height, x2: instrct[i++] / width, y2: instrct[i++] / height, x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'Q') { // Quadratic Bezier
      result.push({ type: 'Q', x1: instrct[i++] / width, y1: instrct[i++] / height, x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'Z' || cmd === 'z') { // finish
      result.push({ type: 'Z' })
    } else if (cmd === 'm') { // PAST THIS POINT ARE SVG BUILT GLYPH COMMANDS
      result.push({ type: 'm', x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'l') {
      result.push({ type: 'l', x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'c') {
      result.push({ type: 'c', x1: instrct[i++] / width, y1: instrct[i++] / height, x2: instrct[i++] / width, y2: instrct[i++] / height, x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'q') {
      result.push({ type: 'q', x1: instrct[i++] / width, y1: instrct[i++] / height, x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'H') {
      result.push({ type: 'H', x: instrct[i++] / width })
    } else if (cmd === 'h') {
      result.push({ type: 'h', x: instrct[i++] / width })
    } else if (cmd === 'V') {
      result.push({ type: 'V', y: instrct[i++] / height })
    } else if (cmd === 'v') {
      result.push({ type: 'v', y: instrct[i++] / height })
    } else if (cmd === 'S') {
      result.push({ type: 'S', x2: instrct[i++] / width, y2: instrct[i++] / height, x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 's') {
      result.push({ type: 's', x2: instrct[i++] / width, y2: instrct[i++] / height, x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'T') {
      result.push({ type: 'T', x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 't') {
      result.push({ type: 't', x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'A') {
      // rx ry x-axis-rotation large-arc-flag sweep-flag x y
      result.push({ type: 'A', rx: instrct[i++] / width, ry: instrct[i++] / height, xar: instrct[i++], laf: instrct[i++], sf: instrct[i++], x: instrct[i++] / width, y: instrct[i++] / height })
    } else if (cmd === 'a') {
      result.push({ type: 'a', rx: instrct[i++] / width, ry: instrct[i++] / height, xar: instrct[i++], laf: instrct[i++], sf: instrct[i++], x: instrct[i++] / width, y: instrct[i++] / height })
    }
  }

  return result
}
