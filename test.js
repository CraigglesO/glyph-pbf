const buildFonts = require('./lib/buildFonts').default

// buildFonts(['./testFonts/NotoSans-Regular.ttf'], './default.pbf')

// buildFonts([{ path: './testFonts/NotoSans-Regular.ttf' }, { path: './testFonts/arial-unicode-ms.ttf' }], './default.pbf')
// buildFonts([{ path: './testFonts/arial-unicode-ms.ttf' }], './default.pbf')

// buildFonts([{ path: './testFonts/Roboto-Regular.ttf', charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' }], './RobotoRegular.pbf')
// buildFonts([{ path: './testFonts/Roboto-Medium.ttf', charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' }], './RobotoMedium.pbf')
// buildFonts([{ path: './testFonts/Roboto-Regular.ttf' }], './RobotoRegular.pbf')
// buildFonts([{ path: './testFonts/Roboto-Medium.ttf' }], './RobotoMedium.pbf')
// buildFonts([{ path: './testFonts/Lato-Bold.ttf', charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' }], './LatoBold.pbf')
buildFonts([{ path: './testFonts/Lato-Bold.ttf' }], './LatoBold.pbf')

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




const fs = require('fs')
const zlib = require('zlib')
const drawLine = require('line-gl').default

const GlyphSet = require('./lib/glyphSet').default

const pbf = zlib.gunzipSync(fs.readFileSync('./default.pbf'))
// const pbf = zlib.gunzipSync(fs.readFileSync('./LatoBold.pbf'))

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
const glyph = glyphSet.get('ر')
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







const width = 0.02

featureCollection = {
  type: 'FeatureCollection',
  features: []
}

strokes.forEach(stroke => {
  const data = drawLine(stroke)
  const { prev, curr, next } = data
  // console.log('line', line)

  for (let i = 0, pl = curr.length; i < pl; i += 2) {
    // grab the variables
    const currX = curr[i]
    const currY = curr[i + 1]
    const nextX = next[i]
    const nextY = next[i + 1]
    const prevX = prev[i]
    const prevY = prev[i + 1]

    // step 1: find the normal
    let dx = nextX - currX
    let dy = nextY - currY
    let mag = Math.sqrt(dx * dx + dy * dy)
    let currNormal = mag ? [-dy / mag, dx / mag] : [0, 0]

    // step 2: draw the quad
    let feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [currX + width * currNormal[0] * -1, currY + width * currNormal[1] * -1],
          [nextX + width * currNormal[0] * -1, nextY + width * currNormal[1] * -1],
          [nextX + width * currNormal[0] * 1, nextY + width * currNormal[1] * 1],
          [currX + width * currNormal[0] * -1, currY + width * currNormal[1] * -1]
        ]]
      }
    }

    featureCollection.features.push(feature)

    feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [currX + width * currNormal[0] * -1, currY + width * currNormal[1] * -1],
          [nextX + width * currNormal[0] * 1, nextY + width * currNormal[1] * 1],
          [currX + width * currNormal[0] * 1, currY + width * currNormal[1] * 1],
          [currX + width * currNormal[0] * -1, currY + width * currNormal[1] * -1]
        ]]
      }
    }

    featureCollection.features.push(feature)

    // find current points prev normal
    dx = currX - prevX
    dy = currY - prevY
    mag = Math.sqrt(dx * dx + dy * dy)
    let prevNormal = mag ? [-dy / mag, dx / mag] : [0, 0]

    if (isCCW([prevX, prevY], [currX, currY], [nextX, nextY])) {
      prevNormal = [-prevNormal[0], -prevNormal[1]]
      currNormal = [-currNormal[0], -currNormal[1]]
    }

    if (!(currX === prevX && currY === prevY)) {
      feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [currX, currY],
            [currX + width * currNormal[0] * 1, currY + width * currNormal[1] * 1],
            [currX + width * prevNormal[0] * 1, currY + width * prevNormal[1] * 1],
            [currX, currY]
          ]]
        }
      }

      featureCollection.features.push(feature)
    }
  }
})

fs.writeFileSync('./strokes.json', JSON.stringify(featureCollection, null, 2))


function isCCW (p1, p2, p3) {
  const val = (p2[1] - p1[1]) * (p3[0] - p2[0]) - (p2[0] - p1[0]) * (p3[1] - p2[1])

  return val < 0
}





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
