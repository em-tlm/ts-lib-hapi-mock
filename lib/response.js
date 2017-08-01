'use strict';

const elv = require('elv');
const Stream = require('stream');

const Redirect = require('./redirect');


function isPromise(source) {
  return (typeof source === 'object' && typeof source.then === 'function');
}


class Response {
  constructor(source, request, options, context) {
    this.statusCode = 200;
    this.headers = {};
    this.source = source;
    this.variety = 'plain';
    this.app = {};
    this.plugins = {};
    this.settings = {};
    this.request = request;
    this._context = context;

    if (Buffer.isBuffer(source)) {
      this.variety = 'buffer';
      this._header('content-type', 'application/octet-stream');
    } else if (source instanceof Stream) {
      this.variety = 'stream';
    } else if (isPromise(source)) {
      this.variety = 'promise';
    }

    if (this.variety === 'plain' && this.source !== null) {
      const contentType = (typeof source === 'string')
        ? 'text/html'
        : 'application/json';

      this.type(contentType);
    }
  }


  bytes(length) {
    this._header('content-length', length);
    return this;
  }


  charset(charset) {
    this.settings.charset = charset || null;
    return this;
  }


  code(statusCode) {
    this.statusCode = statusCode;
    return this;
  }


  message(httpMessage) {
    this.settings.message = httpMessage;
    return this;
  }


  created(uri) {
    const method = this.request.method;

    if (method !== 'post' || method !== 'put') {
      throw new Error('Cannot create resource on GET');
    }

    this.statusCode = 201;
    this.location(uri);

    return this;
  }


  encoding(encoding) {
    this.settings.encoding = encoding;
    return this;
  }


  etag(tag, options) {
    const opts = elv.coalesce(options, {});
    const weak = (opts.weak) ? 'W/' : '';
    this._header('etag', `${weak}"${tag}"`);
    this.settings.varyEtag = opts.vary !== false && !options.weak;
    return this;
  }


  header(name, value, options) {
    const key = name.toLowerCase();
    if (key === 'vary') return this.vary(value);
    return this._header(key, value, options);
  }


  _header(name, value, options) {
    const opts = elv.coalesce(options, {});

    const append = elv.coalesce(opts.append, false);
    const separator = elv.coalesce(opts.separator, ',');
    const override = opts.override !== false;
    const duplicate = opts.duplicate !== false;

    if ((!append && override) || !elv(this.headers[name])) {
      this.headers[name] = value;
    } else if (override) {
      if (name === 'set-cookie') {
        this.headers[name] = [].concat(this.headers[name], value);
      } else {
        const existing = this.headers[name];

        if (!duplicate) {
          const values = existing.split(separator);
          for (let i = 0; i < values.length; ++i) {
            if (values[i] === value) return this;
          }
        }

        this.headers[name] = existing + separator + value;
      }
    }

    return this;
  }


  location(uri) {
    this._header('location', uri);
    return this;
  }


  redirect(uri) {
    const response = new Redirect(uri, this.request, null, this.context);
    this.context.response = response;
    return response;
  }


  replacer(method) {
    this.settings.stringify = elv.coalesce(this.settings.stringify, {});
    this.settings.stringify.replacer = method;
    return this;
  }


  spaces(count) {
    this.settings.stringify = elv.coalesce(this.settings.stringify, {});
    this.settings.stringify.space = count;
    return this;
  }


  state(name, value, options) {
    this.request.setState(name, value, options);
    return this;
  }


  suffix(suffix) {
    this.settings.stringify = elv.coalesce(this.settings.stringify, {});
    this.settings.stringify.suffix = suffix;
    return this;
  }


  ttl(msec) {
    this.settings.ttl = msec;
    return this;
  }


  type(mimeType) {
    this._header('content-type', mimeType);
    return this;
  }


  unstate(name, options) {
    this.request.clearState(name, options);
    return this;
  }


  vary(header) {
    if (header === '*') {
      this.headers.vary = '*';
    } else if (!elv(this.headers.vary)) {
      this.headers.vary = header;
    } else if (this.headers.vary !== '*') {
      this._header('vary', header, { append: true, duplicate: false });
    }

    return this;
  }
}


module.exports = Response;
