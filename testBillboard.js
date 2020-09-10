const buildBillboards = require('./lib/buildBillboards').default

const billboards = [
  // './svgs2/airfield2.svg',
  // './svgs2/aquarium2.svg',
  // './svgs2/cafe2.svg',
  // './svgs2/campsite2.svg',
  // './svgs2/college2.svg',
  // './svgs2/zoo2.svg'
  './svgs2/test.svg'
]

buildBillboards(billboards, 'billboards.pbf')

// READ BACK

const fs = require('fs')
const zlib = require('zlib')
const GlyphSet = require('./lib/glyphSet').default

const pbf = zlib.gunzipSync(fs.readFileSync('./billboards.pbf'))
const glyphSet = new GlyphSet(pbf)

// const zoo2 = glyphSet.get('zoo2')
//
// console.log('glyphSet', glyphSet)
// console.log('zoo2', zoo2)

const glyph = glyphSet.get('0')

// const path = glyph.getPath(false)
// console.log('path', path)

const { indices, vertices, quads, strokes } = glyph.getPath(true, [0, 0], 34, 0.5)
// console.log('indices', indices)
// console.log('vertices', vertices, vertices.length / 3)
// console.log('quads', quads)
// console.log('strokes', strokes)

let featureCollection = {
  type: 'FeatureCollection',
  features: []
}

for (let i = 0, il = indices.length; i < il; i += 3) {
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [vertices[indices[i] * 3], vertices[indices[i] * 3 + 1]],
        [vertices[indices[i + 1] * 3], vertices[indices[i + 1] * 3 + 1]],
        [vertices[indices[i + 2] * 3], vertices[indices[i + 2] * 3 + 1]],
        [vertices[indices[i] * 3], vertices[indices[i] * 3 + 1]]
      ]]
    }
  }

  featureCollection.features.push(feature)
}

fs.writeFileSync('./poly.json', JSON.stringify(featureCollection, null, 2))

const featureCollection2 = {
  type: 'FeatureCollection',
  features: []
}

for (let i = 0, il = quads.length; i < il; i += 3) {
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [vertices[quads[i] * 3], vertices[quads[i] * 3 + 1]],
        [vertices[quads[i + 1] * 3], vertices[quads[i + 1] * 3 + 1]],
        [vertices[quads[i + 2] * 3], vertices[quads[i + 2] * 3 + 1]],
        [vertices[quads[i] * 3], vertices[quads[i] * 3 + 1]]
      ]]
    }
  }

  featureCollection2.features.push(feature)
}

fs.writeFileSync('./quad.json', JSON.stringify(featureCollection2, null, 2))

featureCollection = {
  type: 'FeatureCollection',
  features: []
}

for (let i = 0, sl = strokes.length; i < sl; i += 7 * 3) {
  const v0 = [strokes[i], strokes[i + 1]]
  const v1 = [strokes[i + 7], strokes[i + 8]]
  const v2 = [strokes[i + 14], strokes[i + 15]]

  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        v0,
        v1,
        v2,
        v0
      ]]
    }
  }

  featureCollection.features.push(feature)
}

fs.writeFileSync('./strokes.json', JSON.stringify(featureCollection, null, 2))
