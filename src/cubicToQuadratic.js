// http://www.timotheegroleau.com/Flash/articles/cubic_bezier_in_flash.htm
type Point = [number, number]
type Quadratic = [number, number, number, number]
type QuadraticSegments = [Quadratic, Quadratic, Quadratic, Quadratic]
export default function cubicToQuadratic (P0: Point, P1: Point, P2: Point, P3: Point): QuadraticSegments {
  // calculates the useful base points
  const PA = getPointOnSegment(P0, P1, 3 / 4)
  const PB = getPointOnSegment(P3, P2, 3 / 4)

  // get 1/16 of the [P3, P0] segment
  const dx = (P3[0] - P0[0]) / 16
  const dy = (P3[1] - P0[1]) / 16

  // calculates control point 1
  const PC1 = getPointOnSegment(P0, P1, 3 / 8)

  // calculates control point 2
  const PC2 = getPointOnSegment(PA, PB, 3 / 8)
  PC2[0] -= dx
  PC2[1] -= dy

  // calculates control point 3
  const PC3 = getPointOnSegment(PB, PA, 3 / 8)
  PC3[0] += dx
  PC3[1] += dy

  // calculates control point 4
  const PC4 = getPointOnSegment(P3, P2, 3 / 8)

  // calculates the 3 anchor points
  const PA1 = getMiddle(PC1, PC2)
  const PA2 = getMiddle(PA, PB)
  const PA3 = getMiddle(PC3, PC4)

  // store the four quadratic subsegments
  return [
    [...PC1, ...PA1],
    [...PC2, ...PA2],
    [...PC3, ...PA3],
    [...PC4, P3[0], P3[1]]
  ]
}

function getPointOnSegment (p0: Point, p1: Point, ratio: number): Point {
  return [p0[0] + ((p1[0] - p0[0]) * ratio), p0[1] + ((p1[1] - p0[1]) * ratio)]
}

function getMiddle (p0: Point, p1: Point): Point {
  return [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]
}
