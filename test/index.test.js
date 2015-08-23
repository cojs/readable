/**!
 * co-readable - test/index.test.js
 *
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <m@fengmk2.com> (http://fengmk2.com)
 */

'use strict';

/**
 * Module dependencies.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const readable = require('../');

describe('index.test.js', function () {
  const totalSize = 512 * 1024 + 101;
  const bigfile = path.join(__dirname, 'bigfile');

  before(function () {
    fs.writeFileSync(bigfile, new Buffer(totalSize).fill('a'));
  });

  it('should read with max size 1024 piece by piece', function* () {
    const read = readable(fs.createReadStream(bigfile));

    let buf;
    let size = 0;
    let count = 0;
    while (buf = yield read(1024)) {
      // console.log('read %d bytes', buf.length);
      size += buf.length;
      count++;
    }
    console.log('total read %d bytes, %d times', size, count);
    assert.equal(size, totalSize);
    assert.equal(count, 512 + 1);
  });

  it('should read empty file', function* () {
    const read = readable(fs.createReadStream(path.join(__dirname, 'emptyfile')));

    let buf;
    let size = 0;
    let count = 0;
    while (buf = yield read(1024)) {
      size += buf.length;
      count++;
    }
    console.log('total read %d bytes, %d times', size, count);
    assert.equal(size, 0);
    assert.equal(count, 0);
  });

  it('should read not exists file', function* () {
    const read = readable(fs.createReadStream('not-exists-file'));

    try {
      yield read(100);
      throw new Error('should not run this');
    } catch (err) {
      assert.equal(err.message, 'ENOENT: no such file or directory, open \'not-exists-file\'');
    }
  });
});
