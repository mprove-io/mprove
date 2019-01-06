import * as jwt from 'express-jwt';

let authJwt = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});
