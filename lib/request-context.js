'use strict';

const elv = require('elv');
const Joi = require('joi');

const LifeCycleStage = require('./life-cycle-stage');
const Redirect = require('./redirect');
const Request = require('./request');
const Response = require('./response');


const requestSchema = Joi.object().keys({
  auth: Joi.any(),
  headers: Joi.object(),
  host: Joi.any(),
  method: Joi.any(),
  params: Joi.object(),
  payload: Joi.any(),
  port: Joi.any(),
  query: Joi.object(),
  state: Joi.object(),
  url: Joi.any(),
});

const optionsSchema = Joi.object().keys({
  path: Joi.string().required(),
  handler: Joi.func().required(),
  method: Joi.string().allow(
    'get',
    'head',
    'put',
    'post',
    'patch',
    'delete',
    'trace',
    'options',
    'connect'
  ).required(),
  request: requestSchema,
}).required();

const injectOptionsSchema = Joi.object().keys({
  request: requestSchema,
});

const entityOptionsSchema = Joi.object().keys({
  etag: Joi.string(),
  modified: Joi.string(),
  vary: Joi.boolean(),
}).or('etag', 'modified');


class RequestContext {
  constructor(options) {
    Joi.assert(options, optionsSchema);

    this.path = options.path;
    this.handler = options.handler;
    this.method = options.method;
    this.requestOptions = options.request;
    this.request = null;
    this.response = null;
    this.hasControl = false;
    this.isClosed = false;
    this.lifeCycleStage = LifeCycleStage.default();
  }

  inject(options) {
    if (elv(options)) Joi.assert(options, injectOptionsSchema);

    this.isClosed = false;
    this.hasControl = false;

    if (options !== undefined && 'request' in options) {
      this.requestOptions = options.request;
    }

    const self = this;
    const req = new Request(this.requestOptions);
    this.request = req;

    const reply = function reply(...args) {
      if (arguments.length === 0) {
        self.response = new Response();
        req.response = self.response;
        return self.response;
      }

      const source = (args.length === 2)
        ? args[1]
        : args[0];

      self.response = new Response(source, req);
      req.response = self.response;
      return self.response;
    };

    reply.continue = function _continue() {
      self.hasControl = true;
      return this;
    };

    reply.close = function close() {
      self.isClosed = true;
      return this;
    };

    reply.entity = function entity(opts) {
      Joi.assert(opts, entityOptionsSchema);

      const currentEtag = req.headers['if-none-match'];
      const currentModified = req.headers['if-modified-since'];

      const res = new Response(null, req);
      const vary = elv.cloaesce(options.vary, true);

      if (elv(opts.etag)) res.etag(opts.etag, { vary });
      if (elv(opts.modified)) res.header('last-modified', opts.modified);

      if ((elv(currentEtag) && currentEtag !== opts.etag)
          || (elv(currentModified) && currentModified !== opts.modified)
      ) {
        res.code(304);
        self.response = res;
        req.response = res;
        return res;
      }

      return null;
    };

    reply.redirect = function redirect(uri) {
      const red = new Redirect(uri);
      self.response = red;
      req.response = red;
      return red;
    };

    return this.handler(req, reply);
  }

}

module.exports = RequestContext;
