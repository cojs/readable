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
const debug = require('debug')('co-readable');

module.exports = readable;
module.exports.readAll = readAll;

function readable(stream) {
  let error = null;
  let closed = false;
  stream.on('error', onerror);
  stream.on('close', onclose);

  function onerror(err) {
    debug('stream error: %s', err);
    error = err;
  }

  function onclose() {
    debug('stream close');
    closed = true;
  }

  function cleanup() {
    destroy(stream);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  }

  return function* read(size) {
    if (error) {
      cleanup();
      throw error;
    }

    if (closed) {
      cleanup();
      return;
    }

    const buf = stream.read(size);
    if (buf) {
      return buf;
    }

    // wait for next readable and try again
    const result = yield any(stream, ['readable', 'end', 'error', 'close']);
    debug('got stream %s', result.event);
    if (result.event === 'end' || result.event === 'close') {
      cleanup();
      return;
    }
    if (result.event === 'error') {
      cleanup();
      throw result.data;
    }

    // got readable event
    return yield read(size);
  };
}

function* readAll(stream) {
  const read = readable(stream);
  const buffers = [];
  let buf;
  let size = 0;
  while (buf = yield read()) {
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
