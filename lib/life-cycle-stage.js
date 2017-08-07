'use strict';

module.exports = {
  onRequest: 1,
  lookupRout: 2,
  processQueryExt: 3,
  parseCookies: 4,
  onPreAuth: 5,
  validatePathParams: 6,
  validateQuery: 7,
  validatePayload: 8,
  onPreHandler: 9,
  routePrerequisites: 10,
  routeHandler: 0,
  onPostHandler: 11,
  validateResponsePayload: 12,
  onPreResponse: 13,
  sendResponse: 14,
  response: 15,
  waitForTail: 16,
  tail: 17,

  default: () => 0,
};
