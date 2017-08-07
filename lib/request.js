'use strict';

const elv = require('elv');
const Hoek = require('hoek');


class Request {
  constructor(options, context) {
    const opts = elv.coalesce(options, {});
    const headers = elv.coalesce(opts.headers, {});

    this.app = elv.coalesce(opts.app, {});
    this.auth = elv.coalesce(opts.auth, {});
    this.connection = opts.connection;
    this.domain = opts.domain;
    this.headers = headers;
    this.id = elv.coalesce(opts.id, 'id');
    this.host = elv.coalesce(opts.app, {});
    this.method = elv.coalesce(opts.method, 'get');
    this.mime = elv.coalesce(headers['content-type'], 'application/json');
    this.orig = elv.coalesce(opts.orig, {});
    this.params = elv.coalesce(opts.params, {});
    this.paramsArray = elv.coalesce(opts.paramsArray, []);
    this.path = elv.coalesce(opts.path, '/');
    this.payload = elv.coalesce(opts.payload, null);
    this.plugins = elv.coalesce(opts.plugins, {});
    this.pre = elv.coalesce(opts.pre, {});
    this.response = null;
    this.preResponses = elv.coalesce(opts.preResponses, null);
    this.query = elv.coalesce(opts.query, {});
    this.raw = elv.coalesce(opts.raw, {});
    this.server = elv.coalesce(opts.server, {});
    this.state = elv.coalesce(opts.state, {});
    this.url = elv.coalesce(opts.url, '');

    this.info = {
      acceptEncoding: elv.coalesce(headers['accept-encoding'], ''),
      cors: {
        isOriginMatch: elv(headers.origin),
      },
      host: elv.coalesce(headers.host, ''),
      hostname: elv.coalesce(headers.host, ''),
      received: Date.now.toString(),
      referrer: elv.coalesce(headers.referrer, headers.referer, ''),
      remoteAddress: elv.coalesce(opts.remoteAddress, ''),
      remotePort: elv.coalesce(opts.remotePort, 80),
      responded: elv.coalesce(opts.responded, 0),
    };

    const route = elv.coalesce(opts.route, {});
    const defaultAuth = {
      access: () => true,
    };

    this.route = {
      method: elv.coalesce(route.method, 'get'),
      path: elv.coalesce(route.path, '/'),
      vhost: elv.coalesce(route.vhost, ''),
      realm: elv.coalesce(route.realm, {}),
      settings: elv.coalesce(route.settings, {}),
      fingerprint: elv.coalesce(route.fingerprint, '/'),
      auth: elv.coalesce(route.auth, defaultAuth),
    };

    this._context = context;
  }


  setState(name, value, options) {
    const state = { name, value };

    if (elv(options)) {
      Hoek.assert(
        !options.autoValue,
        'Cannot set autoValue directly in a response'
      );

      state.options = Hoek.clone(options);
    }

    this.state[name] = state;
  }


  clearState(name, options) {
    const state = { name };

    state.options = Hoek.clone(elv.coalesce(options, {}));
    state.options.ttl = 0;

    this.state[name] = state;
  }
}

module.exports = Request;
