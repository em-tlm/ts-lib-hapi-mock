'use strict';

const Response = require('./response');


class Redirect extends Response {
  constructor(uri, request, options, context) {
    super(uri, request, options, context);
    this.header('location', uri).code(302);
  }


  temporary(isTemporary) {
    if (this.statusCode === 301 || this.statusCode === 302) {
      if (isTemporary) this.code(302);
      else this.code(301);
    } else if (isTemporary) {
      this.code(307);
    } else this.code(308);

    return this;
  }


  permanent(isPermanent) {
    return this.temporary(isPermanent === false);
  }


  rewritable(isRewritable) {
    if (this.statusCode === 302 || this.statusCode === 307) {
      if (isRewritable) this.code(302);
      else this.code(307);
    } else if (isRewritable) {
      this.code(301);
    } else this.code(308);

    return this;
  }
}


module.exports = Redirect;
