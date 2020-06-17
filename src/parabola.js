// @flow
export type Mat2d = [
  [number, number],
  [number, number],
  [number, number]
]

export type Parabola = {
  xstart: number,
  xend: number,
  scale: number,
  mat: Mat2d
}

export type SdfVertex = {
  pos: [number, number],
  par: [number, number],
  limits: [number, number],
  scale: number
}

export function fromLine (p0: [number, number], p1: [number, number], lineWidth: number): Parabola {
  // STEP 1: Build the parabola
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

  return [v0, v1, v2, v0, v2, v3]
}

function setParVertex (par: Parabola, pos: [number, number]): SdfVertex {
  return {
    pos,
    par: worldToPar(par, pos),
    limits: [par.xstart, par.xend],
    scale: par.scale
  }
}

function worldToPar (par: Parabola, pos: [number, number]): [number, number] {
  const is = 1 / par.scale
  const dpos = [pos[0] - par.mat[2][0], pos[1] - par.mat[2][1]]
  const r0 = [dpos[0] * par.mat[0][0], dpos[1] * par.mat[0][1]]
  const r1 = [dpos[0] * par.mat[1][0], dpos[1] * par.mat[1][1]]

  return [
    is * (r0[0] + r0[1]),
    is * (r1[0] + r1[1])
  ]
}

function min (a: [number, number], b: [number, number]): [number, number] {
  return [
    a[0] < b[0] ? a[0] : b[0],
    a[1] < b[1] ? a[1] : b[1]
  ]
}

function max (a: [number, number], b: [number, number]): [number, number] {
  return [
    a[0] > b[0] ? a[0] : b[0],
    a[1] > b[1] ? a[1] : b[1]
  ]
}

function mix (start: [number, number], end: [number, number], t: number): [number, number] {
  return [
    start[0] * (1 - t) + end[0] * t,
    start[1] * (1 - t) + end[1] * t
  ]
}

function normalize (v: [number, number]): [number, number] {
  const len = length(v)
  return [
    v[0] / len,
    v[1] / len
  ]
}

function length (v: [number, number]): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1])
}

function perpLeft (v: [number, number]): [number, number] {
  return [-v[1], v[0]]
}
