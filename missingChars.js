const fs = require('fs')
const opentype = require('opentype.js')

const charset = fs.readFileSync('./charset2.txt', 'utf8')

const fontChars = new Set()

const fonts = [
  opentype.loadSync('./testFonts/NotoSansCJKtc-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSans-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansTifinagh-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansEthiopic-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansMyanmar-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansKhmer-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansMongolian-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansCanadianAboriginal-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansNKo-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansArmenian-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansHebrew-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansKannada-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansThai-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansArabic-Medium.ttf'),
  opentype.loadSync('./testFonts/NotoSansLao-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansGeorgian-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansTibetan-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansTamil-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansTelugu-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansBengali-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansDevanagari-Regular.ttf'),
  opentype.loadSync('./testFonts/NotoSansMalayalam-Regular.ttf')
  // opentype.loadSync('./testFonts/arial-unicode-ms.ttf')
]

for (const font of fonts) {
  for (const char of charset) {
    const glyph = font.charToGlyph(char)
    if (glyph.index !== 0) fontChars.add(char)
  }
}

let missingChars = ''

for (const char of charset) {
  if (!fontChars.has(char)) missingChars += char
}

fs.writeFileSync('./missingChars.txt', missingChars)

missingChars = missingChars.split('').map(s => s.charCodeAt(0))
console.log('missingChars', missingChars)
