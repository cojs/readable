co-readable
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/co-readable.svg?style=flat-square
[npm-url]: https://npmjs.org/package/co-readable
[travis-image]: https://img.shields.io/travis/cojs/co-readable.svg?style=flat-square
[travis-url]: https://travis-ci.org/cojs/co-readable
[coveralls-image]: https://img.shields.io/coveralls/cojs/co-readable.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/cojs/co-readable?branch=master
[gittip-image]: https://img.shields.io/gittip/fengmk2.svg?style=flat-square
[gittip-url]: https://www.gittip.com/fengmk2/
[david-image]: https://img.shields.io/david/cojs/co-readable.svg?style=flat-square
[david-url]: https://david-dm.org/cojs/co-readable
[download-image]: https://img.shields.io/npm/dm/co-readable.svg?style=flat-square
[download-url]: https://npmjs.org/package/co-readable

Easy way to read stream data with [co](https://www.npmjs.com/package/co).

## Install

```bash
$ npm i co-readable
```

## Usage

### `readable(stream)`

Read a stream data buffer piece by piece.

```js
const fs = require('fs');
const readable = require('co-readable');
const co = require('co');

const read = readable(fs.createReadStream('bigfile'));

co(function* () {
  let buf;
  let size = 0;
  while (buf = yield read(1024)) {
    console.log('read %d bytes', buf.length);
    size += buf.length;
  }
  console.log('total read %d bytes', size);
}).catch(function (err) {
  console.error(err.stack);
});
```

### `readable.all(stream)`

Read all data into one buffer.

```js
const fs = require('fs');
const readable = require('co-readable');
const co = require('co');

co(function* () {
  const buf = yield readable.readAll(fs.createReadStream('bigfile'));
  console.log('total read %d bytes', buf.length);
}).catch(function (err) {
  console.error(err.stack);
});
```

## License

[MIT](LICENSE)
