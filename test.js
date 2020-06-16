const fs = require('fs')
// const buildFonts = require('./lib/buildFonts').default
// const charset = fs.readFileSync('./charset2.txt', 'utf8')
//
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
//   // './testFonts/NotoSansArabicUI-Regular.ttf',
//   './testFonts/NotoSansLao-Regular.ttf',
//   './testFonts/NotoSansGeorgian-Regular.ttf',
//   './testFonts/NotoSansTibetan-Regular.ttf',
//   './testFonts/NotoSansTamil-Regular.ttf',
//   './testFonts/NotoSansTelugu-Regular.ttf',
//   './testFonts/NotoSansBengali-Regular.ttf',
//   './testFonts/NotoSansDevanagari-Regular.ttf',
//   './testFonts/NotoSansMalayalam-Regular.ttf',
//   // './testFonts/NotoSansCJKtc-Regular.ttf',
//   './testFonts/arial-unicode-ms.ttf'
// ]
//
// buildFonts(fonts.map(font => { return { path: font, charset } }), './default.pbf')

// buildFonts(['./testFonts/NotoSans-Regular.ttf'], './default.pbf')

// buildFonts([{ path: './testFonts/NotoSans-Regular.ttf' }, { path: './testFonts/arial-unicode-ms.ttf' }], './default.pbf')
// buildFonts([{ path: './testFonts/arial-unicode-ms.ttf' }], './default.pbf')
// buildFonts([{ path: './testFonts/arial-unicode-ms.ttf', charset }], './default.pbf')

// buildFonts([{ path: './testFonts/Roboto-Regular.ttf', charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' }], './RobotoRegular.pbf')
// buildFonts([{ path: './testFonts/Roboto-Medium.ttf', charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' }], './RobotoMedium.pbf')
// buildFonts([{ path: './testFonts/Roboto-Regular.ttf', charset }], './RobotoRegular.pbf')
// buildFonts([{ path: './testFonts/Roboto-Medium.ttf', charset }], './RobotoMedium.pbf')
// buildFonts([{ path: './testFonts/Lato-Bold.ttf', charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' }], './LatoBold.pbf')
// buildFonts([{ path: './testFonts/Lato-Bold.ttf', charset }], './LatoBold.pbf')

// 352K	LatoBold.pbf
// 380K LatoBold.pbf with kerningPairs

// building glyph roboto-medium:é
// Object { advanceWidth: 0.422119140625, bbox: (4) […] }
// 1.48b2ad6b.chunk.worker.js:24756:13
// building glyph default:皖
// Object { advanceWidth: 0.778076171875, bbox: (4) […] }
// 1.48b2ad6b.chunk.worker.js:24756:13
// building glyph roboto-medium:í
// Object { advanceWidth: 0.206787109375, bbox: (4) […] }

// building glyph default:ر
// Object { advanceWidth: 0.327392578125, bbox: (4) […] }
// 1.48b2ad6b.chunk.worker.js:24756:13
// building glyph default:赣
// Object { advanceWidth: 0.778076171875, bbox: (4) […] }




// const fs = require('fs')
const zlib = require('zlib')
const drawLine = require('line-gl').default

const GlyphSet = require('./lib/glyphSet').default

// const pbf = zlib.gunzipSync(fs.readFileSync('./default.pbf'))
// const pbf = zlib.gunzipSync(fs.readFileSync('./LatoBold.pbf'))
const pbf = zlib.gunzipSync(fs.readFileSync('./RobotoMedium.pbf'))

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
const glyph = glyphSet.get('T')
console.log('glyph', glyph)
// const glyph = glyphSet.get('ر')
// const glyph = glyphSet.get('ൽ')
console.timeEnd('getCode')

console.time('buildPath')
const { indices, vertices, quads, strokes } = glyph.getPath()
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


// console.log('strokes', strokes)




// const width = 0.02

featureCollection = {
  type: 'FeatureCollection',
  features: []
}

strokes.forEach(stroke => {
  for (let i = 0, sl = stroke.length; i < sl; i += 3) {
    const v0 = stroke[i]
    const v1 = stroke[i + 1]
    const v2 = stroke[i + 2]

    const feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          v0.pos,
          v1.pos,
          v2.pos,
          v0.pos
        ]]
      }
    }

    featureCollection.features.push(feature)
  }
})

fs.writeFileSync('./strokes.json', JSON.stringify(featureCollection, null, 2))





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
