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
const sleep = require('co-sleep');
const readable = require('../');

describe('index.test.js', function () {
  const totalSize = 512 * 1024 + 101;
  const bigfile = path.join(__dirname, 'bigfile');

  beforeEach(function () {
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

  it('should read without size piece by piece', function* () {
    const read = readable(fs.createReadStream(bigfile));

    let buf;
    let size = 0;
    let count = 0;
    while (buf = yield read()) {
      console.log('read %d bytes', buf.length);
      size += buf.length;
      count++;
    }
    console.log('total read %d bytes, %d times', size, count);
    assert.equal(size, totalSize);
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

  it('should throw error when reading a close stream', function* () {
    const stream = fs.createReadStream(bigfile);
    const read = readable(stream);

    let buf = yield read();
    assert(buf);
    stream.destroy();
    yield sleep(100);
    buf = yield read(10000000);
    assert(!buf);
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

  it('should read after error emit', function* () {
    const read2 = readable(fs.createReadStream('not-exists-file2'));
    yield sleep(10);

    try {
      yield read2(100);
      throw new Error('should not run this');
    } catch (err) {
      assert.equal(err.message, 'ENOENT: no such file or directory, open \'not-exists-file2\'');
    }

    try {
      yield read2();
      throw new Error('should not run this2');
    } catch (err) {
      assert.equal(err.message, 'ENOENT: no such file or directory, open \'not-exists-file2\'');
    }
  });

  describe('readAll()', function () {
    it('should read all data into one buffer', function* () {
      const buf = yield readable.readAll(fs.createReadStream(bigfile));
      console.log('total read %d bytes', buf.length);
      assert.equal(buf.length, totalSize);
    });
  });
});
