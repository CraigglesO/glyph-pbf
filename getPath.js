const opentype = require('opentype.js')

const font = opentype.loadSync('./testFonts/NotoSansCJKtc-Regular.otf')

const path = font.getPath('', 0, 0, 1)

console.log('path', path)
