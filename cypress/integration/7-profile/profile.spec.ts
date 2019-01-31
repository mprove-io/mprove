import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '2-1-user@example.com';
const password = '123123';

function resetData() {
  cy.deletePack({ user_ids: [userId] });
  cy.seedPack({
    users: [
      {
        user_id: userId,
        password: password,
        email_verified: true
      }
    ]
  });
}

describe('2-1-profile', () => {
  beforeEach(() => {
    resetData();
  });

  afterEach(() => {
    cy.noLoading();
  });

  it(`logged in - should see Profile`, () => {
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(constants.PATH_PROFILE);
    cy.get('[data-cy=profileTitle]');
  });

  it(`logged out - should redirect to "${constants.PATH_LOGIN}"`, () => {
    cy.basicVisit(constants.PATH_PROFILE);
    cy.get('[data-cy=loginTitle]');
  });

  it(`expired login token - should redirect to "${
    constants.PATH_LOGIN
  }"`, () => {
    // jwt.io
    // "email": "email@example.com", "exp": 1548929971, "iat": 1548929970
    // HMACSHA256(base64UrlEncode(header) + "." +base64UrlEncode(payload), secretString)
    let expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiZXhwIjoxNTQ4OTI5OTcxLCJpYXQiOjE1NDg5Mjk5NzB9.OWqIvPe_ejFjYwRnZ-ML88v7Xo8VNV6vLJ8c1VYwx1s';
    window.localStorage.setItem('token', expiredToken);
    cy.basicVisit(constants.PATH_PROFILE);
    cy.get('[data-cy=loginTitle]');
  });

  const error1 = api.ServerResponseStatusEnum.AUTHORIZATION_ERROR;

  it(`bad login token - should see ${error1}, redirect to "${
    constants.PATH_LOGIN
  }"`, () => {
    //   "email": "email@example.com", "exp": 999999999999, "iat": 1548929970
    let token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5OTksImlhdCI6MTU0ODkyOTk3MH0.pq_ItpeABZxs5WlZyFqLmpd0CUYr0S5dOQnrSvu3pjg';
    window.localStorage.setItem('token', token);
    cy.basicVisit(constants.PATH_PROFILE);
    cy.get('[data-cy=loginTitle]');
    cy.get('[data-cy=message]').should('contain', error1);
  });
});
