describe('login-title', () => {
  beforeEach(() => {
    console.log('basic_login', Cypress.env('basic_login'))
    cy.visit('/login', {
      auth: {
        username: Cypress.env('basic_login'),
        password: Cypress.env('basic_pass')
      }
    });
  });
  it('should display main heading', () => {
    cy.get('h3').should('contain', 'Sign In');
  });
});
