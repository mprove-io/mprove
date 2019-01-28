// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// tslint:disable-next-line:no-namespace
declare namespace Cypress {
  interface Chainable<Subject> {
    basicVisit(url: string): Cypress.Chainable<Window>;
  }
}

function basicVisit(url: string) {
  cy.visit(url, {
    auth: {
      username: Cypress.env('basic_login'),
      password: Cypress.env('basic_pass')
    }
  });
}

Cypress.Commands.add('basicVisit', basicVisit);
