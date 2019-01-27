describe('register-title', () => {
  beforeEach(() => {
    cy.visit('/register', {
      auth: {
        username: Cypress.env('basic_login'),
        password: Cypress.env('basic_pass')
      }
    });
  });
  it('should display main heading', () => {
    cy.get('h3').should('contain', 'Register');
  });
});
