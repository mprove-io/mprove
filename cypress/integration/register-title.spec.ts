describe('register-title', () => {
  beforeEach(() => {
    cy.basicVisit('/register');
  });
  it('should display main heading', () => {
    cy.get('h3').should('contain', 'Register');
  });
});
