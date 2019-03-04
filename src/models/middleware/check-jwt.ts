// const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

import * as jwt from 'express-jwt';

// Authentication middleware. When used, the
// Access Token must exist and be verified against
// the Auth0 JSON Web Key Set
export const checkJwt = jwt({
  // Dynamically provide a signing key
  // based on the kid in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://mprove.auth0.com/.well-known/jwks.json`
  }),
  // Validate the audience and the issuer.
  issuer: `https://mprove.auth0.com/`,
  // audience: 'https://mprove.auth0.com/api/v2/',
  algorithms: ['RS256']
});
