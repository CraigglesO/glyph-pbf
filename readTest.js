const fs = require('fs')
const MSDF = require('./lib/MSDF').default

const pbf = fs.readFileSync('./fontPack.pbf')

const msdf = new MSDF(pbf, true)

console.log('msdf', msdf)
console.log('info', msdf.fonts.robotoMedium.info)
// console.log('chars', msdf.fonts.robotoMedium.chars)
// console.log('kernings', msdf.fonts.robotoMedium.kernings)
console.log('textures', msdf.fonts.robotoRegular.textures, '\n', msdf.fonts.robotoMedium.textures)
console.log('chars', msdf.fonts.robotoMedium.chars.f)
console.log('chars', msdf.fonts.robotoMedium.chars.i)
