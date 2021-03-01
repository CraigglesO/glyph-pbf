const fs = require('fs')
const buildFonts = require('./lib/buildFonts').default
let charset = fs.readFileSync('./placeCharset.txt', 'utf8')

charset += ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'

// const fonts = [
//   './testFonts/NotoSans-Regular.ttf',
//   './testFonts/NotoSansTifinagh-Regular.ttf',
//   './testFonts/NotoSansEthiopic-Regular.ttf',
//   './testFonts/NotoSansMyanmar-Regular.ttf',
//   './testFonts/NotoSansKhmer-Regular.ttf',
//   './testFonts/NotoSansMongolian-Regular.ttf',
//   './testFonts/NotoSansCanadianAboriginal-Regular.ttf',
//   './testFonts/NotoSansNKo-Regular.ttf',
//   './testFonts/NotoSansArmenian-Regular.ttf',
//   './testFonts/NotoSansHebrew-Regular.ttf',
//   './testFonts/NotoSansKannada-Regular.ttf',
//   './testFonts/NotoSansThai-Regular.ttf',
//   './testFonts/NotoSansArabic-Medium.ttf',
//   './testFonts/NotoSansLao-Regular.ttf',
//   './testFonts/NotoSansGeorgian-Regular.ttf',
//   './testFonts/NotoSansTibetan-Regular.ttf',
//   './testFonts/NotoSansTamil-Regular.ttf',
//   './testFonts/NotoSansTelugu-Regular.ttf',
//   './testFonts/NotoSansBengali-Regular.ttf',
//   './testFonts/NotoSansDevanagari-Regular.ttf',
//   './testFonts/NotoSansMalayalam-Regular.ttf',
//   './testFonts/NotoSansCJKtc-Regular.ttf',
//   './testFonts/NotoSansCJKjp-Regular.otf',
//   './testFonts/NotoSansCJKkr-Regular.otf',
//   './testFonts/NotoSansCJKsc-Regular.otf',
//   './testFonts/NotoSansCJKtc-Regular.otf'
// ]
//
// buildFonts(fonts, charset + ' ', './default.pbf')
//
// buildFonts(['./testFonts/Roboto-Medium.ttf'], charset + ' ', './RobotoMedium.pbf')
// buildFonts(['./testFonts/Roboto-Regular.ttf'], charset + ' ', './RobotoRegular.pbf')

// old default 1.4M
// new default 1.0M
// old RobotoMedium - 41K
// new RobotoMedium - 29K
// old RobotoRegular - 42K
// new RobotoRegular - 28K

// const fs = require('fs')
const zlib = require('zlib')

const GlyphSet = require('./lib/glyphSet').default

const pbf = zlib.gunzipSync(fs.readFileSync('./default.pbf'))
// const pbf = zlib.gunzipSync(fs.readFileSync('./testFont.pbf'))
// const pbf = zlib.gunzipSync(fs.readFileSync('./RobotoMedium.pbf'))

console.time('build')
const glyphSet = new GlyphSet(pbf)
console.timeEnd('build')

// console.log('kern f-i combo', glyphSet.kerningPairs['f'.charCodeAt(0)])
// console.log('f', 'f'.charCodeAt(0))
// console.log('i', 'i'.charCodeAt(0))

console.time('getCode')
// const char = 'μή'.charCodeAt(0)
// const char = 'a'.charCodeAt(0)
// const char = 'T'.charCodeAt(0)
// const char = '死'.charCodeAt(0)
// const char = 'a'.charCodeAt(0)
// const char = 469
// const char = 9633
// const a = 'a'
// const glyph = glyphSet.get('a')
// const glyph = glyphSet.get(String.fromCharCode(3640))
// const glyph = glyphSet.get('ر')
// const glyph = glyphSet.get('ൽ')
// const glyph = glyphSet.get('死')
const glyph = glyphSet.get('U')
// const glyph = glyphSet.get('ស')
console.timeEnd('getCode')

console.log('glyph', glyph)

console.time('buildPath')
const { indices, vertices, quads, strokes } = glyph.getPath(true, [50, 10], 34, 1)
// const { indices, vertices, quads, strokes } = glyph2.getPath(true, [glyph.advanceWidth, 0], 34, 1)
console.timeEnd('buildPath')

// console.log('strokes', strokes)

// console.log('getGlyph', getGlyph)

// console.log('glyph', glyph)
// console.log('quads', quads)
// console.log('indices', indices)
// console.log('vertices', vertices)
// console.log('vertices', vertices.length)
// console.log('count', indices.length + vertices.length + quads.length)

let featureCollection = {
  type: 'FeatureCollection',
  features: []
}

for (let i = 0, il = indices.length; i < il; i += 3) {
  // console.log(vertices[indices[i] * 3 + 2], vertices[indices[i + 1] * 3 + 2], vertices[indices[i + 2] * 3 + 2])
  const feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [vertices[indices[i] * 3] + (glyph.advanceWidth * 0), vertices[indices[i] * 3 + 1]],
        [vertices[indices[i + 1] * 3] + (glyph.advanceWidth * 0), vertices[indices[i + 1] * 3 + 1]],
        [vertices[indices[i + 2] * 3] + (glyph.advanceWidth * 0), vertices[indices[i + 2] * 3 + 1]],
        [vertices[indices[i] * 3] + (glyph.advanceWidth * 0), vertices[indices[i] * 3 + 1]]
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
  // console.log(vertices[quads[i] * 3 + 2], vertices[quads[i + 1] * 3 + 2], vertices[quads[i + 2] * 3 + 2])
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




// const width = 0.02

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
