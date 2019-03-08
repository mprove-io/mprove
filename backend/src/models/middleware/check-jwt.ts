import * as jwt from 'express-jwt';

export const checkJwt = jwt({
  secret: process.env.BACKEND_JWT_SECRET,
  requestProperty: 'user',
  getToken: function fromHeaderOrQuerystring(req) {
    let authHeader: string = <string>req.headers.auth;
    authHeader = authHeader ? authHeader.toString() : undefined;

    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
});
