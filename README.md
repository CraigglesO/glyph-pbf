# glyph-pbf [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![min](https://badgen.net/bundlephobia/min/glyph-pbf)](https://bundlephobia.com/result?p=glyph-pbf) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[travis-image]: https://travis-ci.org/regia-corporation/glyph-pbf.svg?branch=master
[travis-url]: https://travis-ci.org/regia-corporation/glyph-pbf
[npm-image]: https://img.shields.io/npm/v/glyph-pbf.svg
[npm-url]: https://npmjs.org/package/glyph-pbf
[downloads-image]: https://img.shields.io/npm/dm/glyph-pbf.svg
[downloads-url]: https://www.npmjs.com/package/glyph-pbf

## About

**Create new modules with this skeleton**

```sh
# grab the package
git clone https://github.com/Regia/glyph-pbf.git
# remove the origin
git remote rm origin
# download the dependencies
yarn
```


### Example use
```js
// ES6
import buildFonts from 'glyph-pbf'
// ES5
const buildFonts = require('glyph-pbf').default

// buildFonts([inputFile, inputFile], outputFileName)
buildFonts(['./testFonts/NotoSans-Regular.ttf', './testFonts/arial-unicode-ms.ttf'], './default.pbf')

```

---

## ISC License (ISC)

Copyright 2019 <Regia>
Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
