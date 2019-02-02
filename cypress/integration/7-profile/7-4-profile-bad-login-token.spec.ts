import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '7-4-user@example.com';
const password = '123123';
const error1 = api.ServerResponseStatusEnum.AUTHORIZATION_ERROR;

describe('7-4 profile-bad-login-token', () => {
  it(`should see ${error1}, redirect to "${constants.PATH_LOGIN}"`, () => {
    //   "email": "email@example.com", "exp": 999999999999, "iat": 1548929970
    let token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5OTksImlhdCI6MTU0ODkyOTk3MH0.pq_ItpeABZxs5WlZyFqLmpd0CUYr0S5dOQnrSvu3pjg';
    window.localStorage.setItem('token', token);

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
    cy.basicVisit(constants.PATH_PROFILE);
    cy.loading();
    cy.get('[data-cy=loginTitle]');
    cy.get('[data-cy=infoMessage]').should('contain', error1);
  });
});
