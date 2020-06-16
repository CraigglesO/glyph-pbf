const fs = require('fs')

const charset = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'

const charsetFile = fs.readFileSync('./charset.txt', 'utf8')

const set = new Set()

for (const char of charset) set.add(char)
for (const char of charsetFile) set.add(char)

const newSet = [...set].join('')

console.log('newSet', newSet)

fs.writeFileSync('./charset2.txt', newSet)
