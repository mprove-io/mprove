import { browser, element, by } from 'protractor';
import { appearTime } from '../e2e.config';
import { CommonPage } from './common.po';

export class LoginPage {
  loginWithEmail(emailEx: string, passwordEx: string) {
    // tslint:disable:max-line-length
    let authLockEmailLocator = by.css(
      '#auth0-lock-container-2 > div > div.auth0-lock-center > form > div > div > div:nth-child(3) > span > div > div > div > div > div > div > div > div > div:nth-child(4) > div.auth0-lock-input-block.auth0-lock-input-email > div > input'
    );
    let authLockPasswordLocator = by.css(
      '#auth0-lock-container-2 > div > div.auth0-lock-center > form > div > div > div:nth-child(3) > span > div > div > div > div > div > div > div > div > div:nth-child(4) > div.auth0-lock-input-block.auth0-lock-input-show-password > div > div > input'
    );
    let authLockLoginLocator = by.css(
      '#auth0-lock-container-2 > div > div.auth0-lock-center > form > div > div > button > span'
    );

    browser.wait(
      () => browser.isElementPresent(authLockEmailLocator),
      appearTime
    );
    browser.wait(
      () => browser.isElementPresent(authLockPasswordLocator),
      appearTime
    );
    browser.wait(
      () => browser.isElementPresent(authLockLoginLocator),
      appearTime
    );

    let emailElement = element(authLockEmailLocator);
    let passwordElement = element(authLockPasswordLocator);
    let loginElement = element(authLockLoginLocator);

    emailElement.clear().then(() => emailElement.sendKeys(emailEx));
    passwordElement.clear().then(() => passwordElement.sendKeys(passwordEx));
    loginElement.click();
  }
}
