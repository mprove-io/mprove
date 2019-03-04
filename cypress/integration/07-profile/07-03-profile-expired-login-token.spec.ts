import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

describe('07-03 profile-expired-login-token', () => {
  it(`should redirect to "${constants.PATH_LOGIN}"`, () => {
    // jwt.io
    // "email": "email@example.com", "exp": 1548929971, "iat": 1548929970
    // HMACSHA256(base64UrlEncode(header) + "." +base64UrlEncode(payload), secretString)
    let expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiZXhwIjoxNTQ4OTI5OTcxLCJpYXQiOjE1NDg5Mjk5NzB9.OWqIvPe_ejFjYwRnZ-ML88v7Xo8VNV6vLJ8c1VYwx1s';
    window.localStorage.setItem('token', expiredToken);

    cy.basicVisit(constants.PATH_PROFILE);
    cy.get('[data-cy=loginTitle]').should('exist');
  });
});
