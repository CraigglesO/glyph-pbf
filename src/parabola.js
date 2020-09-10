// @flow
export type Point = [number, number]

export type Mat2d = [
  Point,
  Point,
  Point
]

export type Parabola = Array<number>

export type SdfVertex = {
  pos: Point,
  par: Point,
  limits: Point,
  scale: number
}

export function fromLine (p0: Point, p1: Point, lineWidth: number): Parabola {
  if (p0[0] === p1[0] && p0[1] === p1[1]) return []
  // STEP 1: Build the "parabola"
  const PRECISION = 1e-16

  const p1p0 = [p1[0] - p0[0], p1[1] - p0[1]]

  const pc = mix(p0, p1, 0.5)
  const xAxis = normalize(p1p0)
  const ldir = length(p1p0)
  const yAxis = perpLeft(xAxis)
  const ylen = ldir * PRECISION
  const vertex = [pc[0] + ylen * yAxis[0], pc[1] + ylen * yAxis[1]]
  const xlen = Math.sqrt(PRECISION)

  const par = {
    xstart: -xlen,
    xend: xlen,
    scale: 0.5 * ldir / xlen,
    mat: [xAxis, yAxis, vertex]
  }

  // STEP 2: Build quads according to the parabola
  const vmin = min(p0, p1)
  const vmax = max(p0, p1)
  vmin[0] -= lineWidth
  vmin[1] -= lineWidth
  vmax[0] += lineWidth
  vmax[1] += lineWidth

  // lineRect(par, vmin, vmax, lineWidth, vertices)
  const v0 = setParVertex(par, [vmin[0], vmin[1]])
  const v1 = setParVertex(par, [vmax[0], vmin[1]])
  const v2 = setParVertex(par, [vmax[0], vmax[1]])
  const v3 = setParVertex(par, [vmin[0], vmax[1]])

  return [...v0, ...v1, ...v2, ...v0, ...v2, ...v3]
}

export function fromQuadratic (p0: Point, p1: Point, p2: Point): Parabola {
  // STEP 1: Build the "parabola"
  const pc = mix(p0, p2, 0.5)
  const yaxis = normalize([pc[0] - p1[0], pc[1] - p1[1]])
  const xaxis = perpRight(yaxis)

  const p01 = normalize([p1[0] - p0[0], p1[1] - p0[1]])
  const p12 = normalize([p2[0] - p1[0], p2[1] - p1[1]])
  const cx0 = dot(xaxis, p01 )
  const sx0 = dot(yaxis, p01 )
  const cx2 = dot(xaxis, p12 )
  const sx2 = dot(yaxis, p12 )

  const x0 = sx0 / cx0 * 0.5
  const x2 = sx2 / cx2 * 0.5
  const y0 = x0 * x0

  const p02x = dot([p2[0] - p0[0], p2[1] - p0[1]], xaxis)
  const scale = p02x / (x2 - x0)
  const vertex = [
    p0[0] - y0 * scale * [0] - x0 * scale * xaxis[0],
    p0[1] - y0 * scale * [1] - x0 * scale * xaxis[1],
  ]

  const par = {
    scale: scale,
    mat: [xAxis, yAxis, vertex]
  }

  if (x0 < x2) {
    par.xstart = x0
    par.xend = x2
  } else {
    par.xstart = x2
    par.xend = x0
  }

  // TODO: STEP 2: Build quads according to the parabola
}

function setParVertex (par: Parabola, pos: Point): SdfVertex {
  return [
    ...pos, // position
    ...worldToPar(par, pos), // parabola
    par.xstart, par.xend, // limits
    par.scale // scale
  ]
}

function worldToPar (par: Parabola, pos: Point): Point {
  const is = 1 / par.scale
  const dpos = [pos[0] - par.mat[2][0], pos[1] - par.mat[2][1]]
  const r0 = [dpos[0] * par.mat[0][0], dpos[1] * par.mat[0][1]]
  const r1 = [dpos[0] * par.mat[1][0], dpos[1] * par.mat[1][1]]

  return [
    is * (r0[0] + r0[1]),
    is * (r1[0] + r1[1])
  ]
}

function min (a: Point, b: Point): Point {
  return [
    a[0] < b[0] ? a[0] : b[0],
    a[1] < b[1] ? a[1] : b[1]
  ]
}

function max (a: Point, b: Point): Point {
  return [
    a[0] > b[0] ? a[0] : b[0],
    a[1] > b[1] ? a[1] : b[1]
  ]
}

function mix (start: Point, end: Point, t: number): Point {
  return [
    start[0] * (1 - t) + end[0] * t,
    start[1] * (1 - t) + end[1] * t
  ]
}

function normalize (v: Point): Point {
  const len = length(v)
  return [
    v[0] / len,
    v[1] / len
  ]
}

function length (v: Point): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1])
}

function perpLeft (v: Point): Point {
  return [-v[1], v[0]]
}

function perpRight (v: Point): Point {
  return [v[1], -v[0]]
}

function dot (v1: Point, v2: Point): number {
  return v1[0] * v2[0] + v1[1] * v2[1]
}
