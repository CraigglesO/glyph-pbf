const fs = require('fs')

let charset = fs.readFileSync('./charset3.txt', 'utf8')

const set = new Set()

for (const char of charset) {
  set.add(char)
  set.add(char.toUpperCase())
}

charset = [...set].join('')

charset = charset
  .split('')
  .map(s => s.charCodeAt(0))
  .sort().map(u => String.fromCharCode(u)).join('')

fs.writeFileSync('./charset4.txt', charset)
