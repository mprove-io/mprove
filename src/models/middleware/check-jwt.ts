import * as jwt from 'express-jwt';

export const checkJwt = jwt({
  secret: 'MY_SECRET',
  requestProperty: 'user'
});
