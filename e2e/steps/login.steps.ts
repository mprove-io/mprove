import { expect } from 'chai';
import { browser } from 'protractor';
import { LoginPage } from '../po/login.po';
import { CommonPage } from '../po/common.po';

const { Before, Given, Then } = require('cucumber');

let loginPage: LoginPage;

Before(() => {
  loginPage = new LoginPage();
});

Then(
  /^\[login\] I login with Email '(.+)' and Password '(.+)'$/,
  (emailEx: string, passwordEx: string) =>
    loginPage.loginWithEmail(emailEx, passwordEx)
);
