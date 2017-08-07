'use strict';

const assert = require('chai').assert;

const { Request, RequestContext, Response } = require('../../lib');


describe('RequestContext', () => {
  describe('#constructor', () => {
    it('should throw if no options provided', () => {
      assert.throws(() => {
        const context = new RequestContext();
        assert.isNotOk(context);
      });
    });

    it('should throw if no path provided', () => {
      assert.throws(() => {
        const context = new RequestContext({
          method: 'get',
          handler: () => {},
        });
        assert.isNotOk(context);
      });
    });

    it('should throw if no method provided', () => {
      assert.throws(() => {
        const context = new RequestContext({
          metpath: '/test',
          handler: () => {},
        });
        assert.isNotOk(context);
      });
    });

    it('should throw if no handler provided', () => {
      assert.throws(() => {
        const context = new RequestContext({
          path: '/test',
          method: 'get',
        });
        assert.isNotOk(context);
      });
    });

    it('should throw if handler not a function', () => {
      assert.throws(() => {
        const context = new RequestContext({
          path: '/test',
          method: 'get',
          handler: 42,
        });
        assert.isNotOk(context);
      });
    });

    it('should throw if handler arity not 2', () => {
      assert.throws(() => {
        const context = new RequestContext({
          path: '/test',
          method: 'get',
          handler: () => {},
        });
        assert.isNotOk(context);
      });
    });

    it('should throw if passed invaid request config', () => {
      assert.throws(() => {
        const context = new RequestContext({
          path: '/test',
          method: 'get',
          handler: () => {},
          request: 42,
        });
        assert.isNotOk(context);
      });
    });
  });

  describe('#inject', () => {
    it('should throw if options not an object', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: () => {},
      });

      assert.throws(() => {
        context.inject(42);
      });
    });

    it('should throw if options.request not an object', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: () => {},
      });

      assert.throws(() => {
        context.inject({
          request: 42,
        });
      });
    });

    it('should throw if options.request invalid', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: () => {},
      });

      assert.throws(() => {
        context.inject({
          request: { nope: 42 },
        });
      });
    });

    it('should inject instance of Request', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req) => {
          assert.instanceOf(req, Request);
        },
      });

      context.inject();
    });

    it('should inject reply interface', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          assert.isOk(reply);
        },
      });

      context.inject();
    });

    it('should inject reply interface as function', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          assert.isFunction(reply);
        },
      });

      context.inject();
    });

    it('should inject reply interface with continue method', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          assert.isFunction(reply.continue);
        },
      });

      context.inject();
    });

    it('should inject reply interface with close method', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          assert.isFunction(reply.close);
        },
      });

      context.inject();
    });

    it('should inject reply interface with entity method', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          assert.isFunction(reply.entity);
        },
      });

      context.inject();
    });

    it('should inject reply interface with redirect method', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          assert.isFunction(reply.redirect);
        },
      });

      context.inject();
    });

    it('should throw when reply is called with more than two args', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          assert.isFunction(reply);
        },
      });

      context.inject();
    });

    it('should return instance of Response on reply', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          const res = reply();
          assert.instanceOf(res, Response);
        },
      });

      context.inject();
    });

    it('should pass provided source to Response on reply', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          const res = reply(42);
          assert.strictEqual(res.source, 42);
        },
      });

      context.inject();
    });

    it('should pass bound request to Response on reply', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          const res = reply(42);
          assert.strictEqual(res.request, req);
        },
      });

      context.inject();
    });

    it('should use second arg for source on reply', () => {
      const context = new RequestContext({
        path: '/path',
        method: 'get',
        handler: (req, reply) => {
          const res = reply(false, 42);
          assert.strictEqual(res.source, 42);
        },
      });

      context.inject();
    });
  });
});
