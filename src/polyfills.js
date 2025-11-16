// Comprehensive polyfills for Node.js APIs in browser environment
// This file should be imported before any other modules that use Node.js APIs

// Global polyfill
// Ensure globalThis and web fetch APIs are accessible for libraries that do
// const { Request, Response, Headers, fetch } = globalThis
if (typeof globalThis === 'undefined') {
  window.globalThis = window;
}
if (typeof window !== 'undefined') {
  // Some bundlers/modules try to destructure from globalThis before these are set
  const maybeCopy = (key) => {
    if (typeof globalThis[key] === 'undefined' && typeof window[key] !== 'undefined') {
      globalThis[key] = window[key];
    }
  };
  maybeCopy('fetch');
  maybeCopy('Request');
  maybeCopy('Response');
  maybeCopy('Headers');
  if (typeof self === 'undefined') {
    // Align with web worker environments that expect self
    window.self = window;
  }
}
if (typeof global === 'undefined') {
  window.global = window;
}

// Process polyfill with nextTick
if (typeof process === 'undefined') {
  window.process = {
    nextTick: (callback, ...args) => {
      // Use setTimeout with 0 delay to simulate nextTick behavior
      setTimeout(() => callback(...args), 0);
    },
    env: {
      NODE_ENV: 'development'
    },
    browser: true,
    version: '',
    versions: {}
  };
} else {
  // Ensure process.nextTick exists
  if (typeof process.nextTick === 'undefined') {
    process.nextTick = (callback, ...args) => {
      setTimeout(() => callback(...args), 0);
    };
  }
  
  // Ensure process.env exists
  if (!process.env) {
    process.env = {
      NODE_ENV: 'development'
    };
  }
}

// Buffer polyfill
if (typeof Buffer === 'undefined') {
  try {
    window.Buffer = require('buffer').Buffer;
  } catch (e) {
    // Fallback Buffer implementation
    window.Buffer = class Buffer {
      constructor(data, encoding) {
        this.data = data;
        this.encoding = encoding;
      }
      
      static from(data, encoding) {
        return new Buffer(data, encoding);
      }
      
      toString(encoding) {
        return String(this.data);
      }
    };
  }
}

// Stream polyfill
if (typeof require !== 'undefined') {
  try {
    // Try to require stream polyfill
    const { Readable } = require('stream-browserify');
    if (typeof window !== 'undefined') {
      window.Readable = Readable;
    }
  } catch (e) {
    console.warn('Stream polyfill not available:', e.message);
  }
}

// Util polyfill
if (typeof require !== 'undefined') {
  try {
    const util = require('util');
    if (typeof window !== 'undefined') {
      window.util = util;
    }
  } catch (e) {
    console.warn('Util polyfill not available:', e.message);
    // Fallback util implementation
    window.util = {
      inspect: (obj) => JSON.stringify(obj, null, 2),
      debuglog: () => () => {},
      format: (format, ...args) => {
        return format.replace(/%[sdj%]/g, (match) => {
          if (match === '%%') return '%';
          const arg = args.shift();
          return String(arg);
        });
      }
    };
  }
} else {
  // Browser fallback util implementation
  window.util = {
    inspect: (obj) => JSON.stringify(obj, null, 2),
    debuglog: () => () => {},
    format: (format, ...args) => {
      return format.replace(/%[sdj%]/g, (match) => {
        if (match === '%%') return '%';
        const arg = args.shift();
        return String(arg);
      });
    }
  };
}

console.log('✅ Polyfills loaded successfully');
