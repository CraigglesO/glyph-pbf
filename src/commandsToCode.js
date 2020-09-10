// @flow
export type Command = {
  type: 'M' | 'm' | 'L' | 'l' | 'H' | 'h' | 'V' | 'v' | 'C' | 'c' | 'Q' | 'q' | 'S' | 's' | 'T' | 't' | 'A' | 'a' | 'Z' | 'z',
  x?: number,
  y?: number,
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number,
  rx?: number,
  ry?: number,
  xar?: number,
  laf?: number,
  sf?: number
}

export type Code = { yOffset: number, path: Array<number> }

// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
export default function commandsToCode (commands: Array<Command>, extent: number,
  multiplier: number = -1, includeYOffset: boolean = true): Code {
  if (!commands.length) return { yOffset: 0, path: [] }
  let prevX: number, prevY: number, same: number, yVal: number
  let yOffset: number = Infinity
  const path = []
  commands.forEach(command => {
    const { type, x, y, x1, y1, x2, y2, rx, ry, xar, laf, sf } = command
    same = (type !== 'V' && type !== 'v' && x === prevX) && (type !== 'H' && type !== 'h' && y === prevY)
    if (type !== 'Z' && type !== 'H' && type !== 'h') {
      yVal = Math.round(multiplier * y * extent)
      yOffset = Math.min(yOffset, yVal)
    }
    if (type === 'M') { // MoveTo
      path.push(0, Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'L') { // LineTo
      if (!same) path.push(1, Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'C') { // cubicBezierTo
      if (!same) path.push(2, Math.round(x1 * extent), Math.round(multiplier * y1 * extent), Math.round(x2 * extent), Math.round(multiplier * y2 * extent), Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'Q') { // quadraticBezierTo
      if (!same) path.push(3, Math.round(x1 * extent), Math.round(multiplier * y1 * extent), Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'Z') { // close
      path.push(4)
    } else if (type === 'm') { // moveTo delta
      if (!same) path.push(5, Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'l') { // lineTo delta
      if (!same) path.push(6, Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'c') { // cubicBezierTo delta
      if (!same) path.push(7, Math.round(x1 * extent), Math.round(multiplier * y1 * extent), Math.round(x2 * extent), Math.round(multiplier * y2 * extent), Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'q') { // quadraticBezierTo delta
      if (!same) path.push(8, Math.round(x1 * extent), Math.round(multiplier * y1 * extent), Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'H') { // horizontalTo
      if (!same) path.push(9, Math.round(x * extent))
    } else if (type === 'h') { // horizontalTo delta
      if (!same) path.push(10, Math.round(x * extent))
    } else if (type === 'V') { // VerticalTo
      if (!same) path.push(11, Math.round(multiplier * y * extent))
    } else if (type === 'v') { // VerticalTo delta
      if (!same) path.push(12, Math.round(multiplier * y * extent))
    } else if (type === 'S') { // partialCubicBezierTo
      if (!same) path.push(13, Math.round(x2 * extent), Math.round(multiplier * y2 * extent), Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 's') { // partialCubicBezierTo delta
      if (!same) path.push(14, Math.round(x2 * extent), Math.round(multiplier * y2 * extent), Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'T') { // partialQuadraticBezierTo
      if (!same) path.push(15, Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 't') { // partialQuadraticBezierTo delta
      if (!same) path.push(16, Math.round(x * extent), Math.round(multiplier * y * extent))
    } else if (type === 'A') {
      // convert to a set of lineTos
      // rx ry x-axis-rotation large-arc-flag sweep-flag x y
      if (!same) path.push(..._arcCurve(extent, multiplier, prevX, prevY, x, y, rx, ry, xar, laf, sf))
    } else if (type === 'a') {
      // convert to a set of lineTos
      // rx ry x-axis-rotation large-arc-flag sweep-flag x y
      if (!same) path.push(..._arcCurve(extent, multiplier, prevX, prevY, prevX + x, prevY + y, rx, ry, xar, laf, sf))
    }
    // update new previous x and y
    if (type !== 'V' && type !== 'v') prevX = x
    if (type !== 'H' && type !== 'h') prevY = y
  })

  return { yOffset: includeYOffset ? yOffset : null, path }
}

function _arcCurve (extent: number, multiplier: number, startX: number, startY: number,
  endX: number, endY: number, rx: number, ry: number, angle: number,
  largeArcFlag: number, sweepFlag: number): Array<number> {
  // console.log('_arcCurve', extent, multiplier, startX, startY, endX, endY, rx, ry, angle, largeArcFlag, sweepFlag)
  const code = []
  const curvePointCount = 7
  // https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
  angle = angle * (Math.PI / 180) // convert angle to radians
  // get transform point
  const dx = (startX - endX) / 2
	const dy = (startY - endY) / 2
  const transformX = Math.cos(angle) * dx + Math.sin(angle) * dy
  const transformY = -Math.sin(angle) * dx + Math.cos(angle) * dy
  // compute center
  const cSquareNumerator = (rx * rx * ry * ry) - (rx * rx * transformY * transformY) - (ry * ry * transformX * transformX)
	const cSquareRootDenom = (rx * rx * transformY * transformY) + (ry * ry * transformX * transformX)
	let cRadicand = cSquareNumerator / cSquareRootDenom
  cRadicand = (cRadicand < 0) ? 0 : cRadicand
  const cCoef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(cRadicand)
  const transformCx = cCoef * ( (rx * transformY) / ry)
  const transformCy = cCoef * ( -(ry * transformX) / rx)
  const cx = Math.cos(angle) * transformCx - Math.sin(angle) * transformCy + ((startX + endX) / 2)
  const cy = Math.sin(angle) * transformCx + Math.cos(angle) * transformCy + ((startY + endY) / 2)
  // compute start angle and sweep size
  const startVectorX = (transformX - transformCx) / rx
  const startVectorY = (transformY - transformCy) / ry
  const endVectorX = (-transformX - transformCx) / rx
  const endVectorY = (-transformY - transformCy) / ry
  let startAngle = _angleBetween(1, 0, startVectorX, startVectorY)
  let sweepAngle = _angleBetween(startVectorX, startVectorY, endVectorX, endVectorY)
  sweepAngle %= 2 * Math.PI
  if (!sweepFlag) sweepAngle = -Math.abs(sweepAngle)
  else sweepAngle = Math.abs(sweepAngle)
  let currX, currY
  // create points
  for (let i = 1; i < curvePointCount; i++) {
    const t = (1 / curvePointCount) * i
    const tAngle = startAngle + (sweepAngle * t)

    currX = Math.round((cx + rx * Math.cos(tAngle)) * extent)
    currY = Math.round((cy + ry * Math.sin(tAngle)) * extent)

    code.push(
      1,
      currX,
      multiplier * currY
    )
  }
  // store the end point
  code.push(1, Math.round(endX * extent), Math.round(multiplier * endY * extent))

  return code
}

function _angleBetween (v0x: number, v0y: number, v1x: number, v1y: number): number {
	const p = v0x * v1x + v0y * v1y
	const n = Math.sqrt((v0x * v0x + v0y * v0y) * (v1x * v1x + v1y * v1y))
	const sign = (v0x * v1y - v0y * v1x < 0) ? -1 : 1
	const angle = sign * Math.acos(p / n)

	return angle
}
