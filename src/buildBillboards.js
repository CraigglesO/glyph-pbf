// @flow
import fs from 'fs'
import Parser from 'fast-xml-parser'
import { gzipSync } from 'zlib'
import elementParser from './elementParser'
import commandsToCode from './commandsToCode'
import reduceSize from './reduceSize'
import serialize from './serialize'

export type Options = {
  extent: number
}

export type Geometry = {
  width: number,
  height: number,
  instructions: Array<number>
}

export type Feature = {
  color: number,
  geometry: number // geometry index
}

export type Color = [number, number, number, number]

export type Billboard = {
  name: string,
  width: number,
  height: number,
  features: Array<Feature>
}

const PARSE_OPTIONS = { parseAttributeValue: true, ignoreAttributes: false, attributeNamePrefix: '' }

export default function buildBillboards (paths: Array<string>, out: string, options?: Options) {
  options = { ...options, extent: 4096 }
  let geometry: Array<Geometry> = []
  const billboards: Array<Billboard> = []
  let colors: Array<Color> = []
  for (const path of paths) buildBuilboard(fs.readFileSync(path, 'utf8'), path.split('/').pop().split('.')[0], billboards, colors, geometry, options)
  // update geometry to conform to commandsToCode
  const glyphMap = new Map()
  geometry.map((geo) => geo.instructions).forEach((geo, i) => {
    geo = commandsToCode(geo, options.extent, 1, false)
    geo.path = reduceSize(geo.path)
    glyphMap.set(i, geo)
  })
  colors = colors.map((color, i) => { return { id: i, red: color[0], green: color[1], blue: color[2], alpha: color[3] }})
  const pbf = serialize(options.extent, glyphMap, null, 'billboard', colors, billboards)
  // step 3, gzip compress and save
  fs.writeFileSync(out, gzipSync(pbf))
}

function buildBuilboard (data: string, name: string, billboards: Array<Billboard>,
  colors: Array<Color>, geometry: Array<Geometry>, options: Options) {
  // parse SVG to JSON
  const parsedSVG = Parser.parse(data, PARSE_OPTIONS)
  const { svg } = parsedSVG

  // first build the Vector
  let height = 0
  let width = 0
  if (svg.height && svg.width) {
    height = +svg.height
    width = +svg.width
  } else if (svg.viewBox) {
    const viewBox = svg.viewBox.split(' ')
    width = +viewBox[2]
    height = +viewBox[3]
  }
  // prep billboard
  const billboard: Billboard = { name, height, width, features: [] }
  // TODO:
  // split colors and apply lookups like geometry
  // finish serialize
  // build Billboard and color into glyphSet

  _parseFeatures(svg, billboard, colors, geometry, options)
  billboards.push(billboard)
}

function _parseFeatures (svg: Object, billboard: Billboard, geometry: Array<Geometry>, options: Options) {
  for (const key in svg) {
    if (key === 'path') {
      if (svg[key]) { // multiple element objects
        if (Array.isArray(svg[key])) {
          for (const element of svg[key]) elementParser(element, billboard, geometry, options)
        } else elementParser(svg[key], billboard, geometry, options) // just one path
      }
    } else if (key === 'g') { _parseFeatures(svg[key], billboard, geometry, options) }
  }
}
