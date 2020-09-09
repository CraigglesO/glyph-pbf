// char 3640 1.cca3eb7d.chunk.worker.js:24436:19
// char 258 1.cca3eb7d.chunk.worker.js:24436:19
// char 3633 3 1.cca3eb7d.chunk.worker.js:24436:19
// char 2509 2 1.cca3eb7d.chunk.worker.js:24436:19
// char 2492 2 1.cca3eb7d.chunk.worker.js:24436:19
// char 2497 1.cca3eb7d.chunk.worker.js:24436:19ุ

char 2509
2glyphBuilder.js:98 char 2492
2glyphBuilder.js:98 char 2509
2glyphBuilder.js:98 char 2492
2glyphBuilder.js:98 char 2509
2glyphBuilder.js:98 char 2492
glyphBuilder.js:98 char 2497
glyphBuilder.js:98 char 2509
5glyphBuilder.js:98 char 2497

// LATIN
// THAI
// BENGALI
const fs = require('fs')

let charset = fs.readFileSync('./charset2.txt', 'utf8')

const unicodes = [3640, 258, 3633, 2509, 2492, 2497].map(u => String.fromCharCode(u))

for (const unicode of unicodes) charset += unicode

charset = charset
  .split('')
  .map(s => s.charCodeAt(0))
  .sort().map(u => String.fromCharCode(u)).join('')

fs.writeFileSync('./charset3.txt', charset)
