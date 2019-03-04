import * as jwt from 'express-jwt';

export const checkJwt = jwt({
  secret: process.env.BACKEND_JWT_SECRET,
  requestProperty: 'user'
});
