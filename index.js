/**!
 * co-readable - index.js
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

const destroy = require('destroy');

module.exports = function readable(stream) {
  return function* (size) {
    return yield read(stream, size);
  };
};

module.exports.read = read;
module.exports.readAll = readAll;

function* read(stream, size) {
  const buf = stream.read(size);
  if (buf) {
    return buf;
  }

  // wait for next readable and try again
  const result = yield any(stream, ['readable', 'end', 'error']);
  if (result.event === 'end') {
    destroy(stream);
    return;
  }
  if (result.event === 'error') {
    destroy(stream);
    throw result.data;
  }

  return yield read(stream, size);
}

function* readAll(stream) {
  const buffers = [];
  let buf;
  let size = 0;
  while (buf = yield read(stream)) {
    buffers.push(buf);
    size += buf.length;
  }
  return Buffer.concat(buffers, size);
}

function any(stream, events) {
  return function (done) {
    const listeners = [];
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      listeners.push({
        event: event,
        fn: onEvent.bind(null, event)
      });
    }

    function onEvent(event, data) {
      cleanup();
      done(null, {
        event: event,
        data: data
      });
    }

    function cleanup() {
      for (let i = 0; i < listeners.length; i++) {
        let listener = listeners[i];
        stream.removeListener(listener.event, listener.fn);
      }
    }

    for (let i = 0; i < listeners.length; i++) {
      let listener = listeners[i];
      stream.on(listener.event, listener.fn);
    }
  };
}
