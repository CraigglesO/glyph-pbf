const buildFonts = require('./lib/buildFonts').default

// buildFonts(['./testFonts/NotoSans-Regular.ttf'], './default.pbf')
// buildFonts(['./testFonts/NotoSans-Regular.ttf', './testFonts/arial-unicode-ms.ttf'], './default.pbf')
buildFonts(['./testFonts/Roboto-Medium.ttf'], './RobotoMedium.pbf')







const fs = require('fs')
const zlib = require('zlib')

const GlyphSet = require('./lib/glyphSet').default

const pbf = zlib.gunzipSync(fs.readFileSync('./RobotoMedium.pbf'))

console.time('build')
const glyphSet = new GlyphSet(pbf)
console.timeEnd('build')

console.time('getCode')
const char = 'b'.charCodeAt(0)
// const a = 97
const glyph = glyphSet.get(char)
console.timeEnd('getCode')

console.time('buildPath')
const { indices, vertices, quads } = glyph.getPath()
console.timeEnd('buildPath')

// console.log('getGlyph', getGlyph)

// console.log('indices', indices)
console.log('vertices', vertices.length)
console.log('count', indices.length + vertices.length + quads.length)

const featureCollection = {
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
        [vertices[indices[i] * 2], vertices[indices[i] * 2 + 1]],
        [vertices[indices[i + 1] * 2], vertices[indices[i + 1] * 2 + 1]],
        [vertices[indices[i + 2] * 2], vertices[indices[i + 2] * 2 + 1]],
        [vertices[indices[i] * 2], vertices[indices[i] * 2 + 1]]
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
        [vertices[quads[i] * 2], vertices[quads[i] * 2 + 1]],
        [vertices[quads[i + 1] * 2], vertices[quads[i + 1] * 2 + 1]],
        [vertices[quads[i + 2] * 2], vertices[quads[i + 2] * 2 + 1]],
        [vertices[quads[i] * 2], vertices[quads[i] * 2 + 1]]
      ]]
    }
  }

  featureCollection2.features.push(feature)
}

fs.writeFileSync('./quad.json', JSON.stringify(featureCollection2, null, 2))
















// fs.writeFileSync('./test.json', JSON.stringify(getA.path.map(num => (num > 7 || num < 0) ? num / 4096 : num), null, 2))
// console.log('path', getA.path.map(num => (num > 7 || num < 0) ? num / 4096 : num))











// const opentype = require('opentype.js')
//
// const font = opentype.loadSync('testFonts/NotoSans-Regular.ttf')
// // const font = opentype.loadSync('testFonts/NotoSansCJKjp-Medium-Alphabetic.ttf')
// // const font = opentype.loadSync('testFonts/arial-unicode-ms.ttf')
//
// // console.log('font', font)
//
// // let count = 0
//
// // русский
// const code = 'κή'.charCodeAt(0)
//
// for (const key in font.glyphs.glyphs) {
//   const glyph = font.glyphs.glyphs[key]
//   // if (glyph.unicode) count++
//   if (glyph.unicode === code) {
//     const path = glyph.getPath(0, 0, 1)
//     console.log(path)
//   }
// }
//
// // console.log(count)
//
// // font.kerningPairs
//
// // console.log('font', font)
