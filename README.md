# ts-hapi-mocks

Testing Hapi.js route handler logic can be difficult due to the need for a `Request` and `Reply` object.  Hapi.js gives the ability to inject requests through a `Server` instance; however, this generates an actual HTTP request, and calls through the entire Hapi.js request pipeline.  This is sufficient for integration tests, but problematic in unit tests.

The `ts-hapi-mocks` library allows you to inject mocked `Request` and `Reply` objects directly into a route handler without creating an HTTP request, and more easily target specific edge cases in your code.

> __Important Note__<br />
This is an incomplete implementation of the Hapi.js request and reply interface.  This is very much a work and progress.  Focus has been placed on building out the pieces we are currently using.  Please ensure that you add anything not currently covered that you utilize in your handlers.

## Usage

First, add `ts-hapi-mocks` as a `devDependency` to your package.

```sh
$ npm install tetrascience/ts-lib-hapi-mocks.git -D
```

Then inject requests into a route handler function using the `RequestContext` object.

```js
const assert = require('chai').assert;
const { RequestContext } = require('ts-hapi-mocks');

const Handler = require('./path/to/handler');

describe('Handler', function() {
  beforeEach(function() {
    /*
      Do whatever dependency injection and bootstrapping you need to do here.
    */
    this.handler = new Handler();
  });

  describe('#findOne', function() {
    beforeEach(function() {
      this.context = new RequestContext({
        path: '/my/route',
        handler: this.handler.findOne
      });
    });

    it('should return 200 status code on success', function(done) {
      this.context.inject()
        .then((request) => {
          assert.strictEqual(this.context.response.statusCode, 200);
          done();
        })
        .catch((err) => {
          assert.fail(err);
          done();
        });
    });
  });
});
```

The `inject()` method will return the immediate result of route handler.  In the example above, the assumption is being made that `Handler.prototype.find()` returns a `Promise`.  Currently, this is the only way to work with asynchronous operations in the `ts-hapi-mocks` module.

## API

### Class: `hapiMocks.RequestContext`

#### `new hapiMocks.RequestContext(options)`

Creates a new instance of the `RequestContext` class.  This is the heart of the `ts-hapi-mocks` module, and is the primary object you will work with in your unit tests.  Instance of `RequestContext` provide an external view of what is going on inside a request handler.

__Parameters__

* `options`: _(required)_ an object with the following keys:

  + `path`: _(required)_ a string that represents the path value of a route.  This isn't really used for anything other than to give value to the `path` property on `Request` instances.

  + `handler`: _(required)_ the Hapi.js route handler to invoke.

  + `request`: _(optional)_ an object that defines default request behaviors.  Keys can be overridden when calling `inject()`.  This object can include the keys:

    - `headers`: _(optional)_ an object that defines the request headers to inject as part of the `Request` object for a route handler.

    - `params`: _(optional)_ an object that defines the route parameters to inject as part of the `Request` object for a route handler.

    - `payload`: _(optional)_ any value to be used as the request payload.

    - `query`: _(optional)_ an object that containing the query parameters, where each key corresponds to the name of a query parameter.

    - `state`: _(optional)_ an object that represents parsed cookie data, where each key is the name of a cookie.

#### `RequestContext.prototype.request`

Gets the `Request` object passed to a route handler by `inject()`.  If `inject()` has not been called yet, this value is `null`.

#### `RequestContext.prototype.response`

Gets the `Response` object passed to a route handler by `inject()`.  If `inject()` has not been called yet, this value is `null`.

#### `RequestContext.prototype.isClosed`

Gets a `Boolean` indicating whether or not the reply pipeline is closed.  This happens when the route handler calls `reply.close()`.  The default value is `false`.

#### `RequestContext.prototype.lifeCycleStage`

Gets or sets the `LifeCycleStage` to use when injecting requests.  What stage a request is in the Hapi.js request pipeline can have ramifications on the behavior of certain methods on the reply interface.  For example, calling `reply.continue()` with a `result` argument in a `tail` handler will result in an error being thrown, but will work without an error if done so during route handling.

#### `RequestContext.prototype.inject(options)`

Invokes the given Hapi.js route handler, and injects a `Request` object and reply interface.

__Parameters__

* `options`: _(optional)_ an object that defines behavior for the `Request` injection.

  + `request`: _(optional)_ an object that defines various conditional aspects of a `Request` instance.  The object can contain the following keys:

    - `headers`: _(optional)_ an object that defines the request headers to inject as part of the `Request` object for a route handler.

    - `params`: _(optional)_ an object that defines the route parameters to inject as part of the `Request` object for a route handler.

    - `payload`: _(optional)_ any value to be used as the request payload.

    - `query`: _(optional)_ an object that containing the query parameters, where each key corresponds to the name of a query parameter.

    - `state`: _(optional)_ an object that represents parsed cookie data, where each key is the name of a cookie.

### Enum: `hapiMocks.LifeCycleStage`

An enumeration of the various request life cycles in the Hapi.js pipeline.

* `onRequest`
* `lookupRout`
* `processQueryExt`
* `parseCookies`
* `onPreAuth`
* `validatePathParams`
* `validateQuery`
* `validatePayload`
* `onPreHandler`
* `routePrerequisites`
* `routeHandler` _the default_
* `onPostHandler`
* `validateResponsePayload`
* `onPreResponse`
* `sendResponse`
* `response`
* `waitForTail`
* `tail`
