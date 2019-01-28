describe('login-title', () => {
  beforeEach(() => {
    cy.basicVisit('/login');
  });
  it('should display main heading', () => {
    cy.get('h3').should('contain', 'Sign In');
  });
});
