// @flow
import type { Options, Geometry, Color, Feature, Billboard } from './'
import parseSVG from 'svg-path-parser'
import parseColor from './color'

type Path = {
  d: string, // path data
  transform?: string,
  fill?: string,
  style?: string,
  opacity?: string,
}

export default function parsePath (path: Path, billboard: Billboard, colors: Array<Color>,
  geometry: Array<Geometry>, options: Options) {
  if (path.style) _injectStyle(path, path.style)
  if (!path.fill) return
  const color = parseColor(path.fill)
  if (!color) return
  if (path.opacity) color[3] = Math.round(+path.opacity * 255)
  const translate = (path.transform && path.transform.includes('translate'))
    ? path.transform.split('(')[1].split(')')[0].split(' ').map(parseFloat)
    : [0, 0]
  const scale = (path.transform && path.transform.includes('scale'))
    ? path.transform.split('(')[1].split(')')[0].split(' ').map(parseFloat)
    : [1, 1]
  // prep geo
  const geo = {
    width: billboard.width,
    height: billboard.height,
    instructions: []
  }
  const maxAspect = (geo.width > geo.height) ? geo.width : geo.height
  // prep knowledge of x or y
  let xTurn = true
  // create the geometry with commands, convert all capital commands to lower-case
  const { d } = path
  if (!d) return
  geo.instructions = parseSVG(d).map(instruction => {
    instruction.type = instruction.code
    if (instruction.code.toUpperCase() === 'A') {
      instruction.xar = instruction.xAxisRotation
      instruction.laf = instruction.largeArc
      instruction.sf = instruction.sweep
    }
    if (instruction.x) instruction.x /= maxAspect
    if (instruction.y) instruction.y /= maxAspect
    if (instruction.x1) instruction.x1 /= maxAspect
    if (instruction.y1) instruction.y1 /= maxAspect
    if (instruction.x2) instruction.x2 /= maxAspect
    if (instruction.y2) instruction.y2 /= maxAspect
    if (instruction.rx) instruction.rx /= maxAspect
    if (instruction.ry) instruction.ry /= -maxAspect
    if (!instruction.relative) {
      if (instruction.y) instruction.y = 1 - instruction.y
      if (instruction.y1) instruction.y1 = 1 - instruction.y1
      if (instruction.y2) instruction.y2 = 1 - instruction.y2
    } else {
      if (instruction.y) instruction.y = -instruction.y
      if (instruction.y1) instruction.y1 = -instruction.y1
      if (instruction.y2) instruction.y2 = -instruction.y2
    }

    return instruction
  })
  const [saveGeo, geoIndex] = _findDuplicateGeometry(geo, geometry)
  const [saveColor, colorIndex] = _findDuplicateColor(color, colors)
  // create feature
  const feature: Feature = {
    color: colorIndex,
    geometry: geoIndex
  }
  // add the feature set
  billboard.features.push(feature)
  // add the color to set
  if (saveColor) colors.push(color)
  // add the geometry set
  if (saveGeo) geometry.push(geo)
}

function _findDuplicateColor (color: Color, colors: Array<Color>) {
  let save = true
  let saveIndex = colors.length
  for (let i = 0, cl = colors.length; i < cl; i++) {
    if (_arraysEqual(color, colors[i])) {
      save = false
      saveIndex = i
      break
    }
  }

  return [save, saveIndex]
}

function _findDuplicateGeometry (geo: Geometry, geometries: Array<Geometry>) {
  let save = true
  let saveIndex = geometries.length
  for (let i = 0, gl = geometries.length; i < gl; i++) {
    const { width, height, instructions } = geometries[i]
    if (geo.width !== width || geo.height !== height) continue
    // check if currentInstructions are the same as instructions
    // if (_arraysEqual(geo.instructions, instructions)) {
    if (JSON.stringify(geo.instructions) === JSON.stringify(instructions)) {
      save = false
      saveIndex = i
      break
    }
  }

  return [save, saveIndex]
}

function _arraysEqual (arr1, arr2) {
  if (arr1.length !== arr2.length) return false
  for (let i = arr1.length; i--;) if (arr1[i] !== arr2[i]) return false

  return true
}

function _injectStyle (obj: Object, style: string) {
  const styles = style.split(';')
  for (const s of styles) {
    if (s.length) {
      const [key, value] = s.split(':')
      obj[key] = value.replace(/\s/g, '')
    }
  }
}
