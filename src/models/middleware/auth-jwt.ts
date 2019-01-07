import * as jwt from 'express-jwt';

export const authJwt = jwt({
  secret: 'MY_SECRET',
  requestProperty: 'user'
});
