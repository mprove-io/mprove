// tslint:disable:max-line-length
import { browser, by, element, ElementFinder } from 'protractor';
import { clickTrue, wait } from '../utils';
import { appearTime } from '../e2e.config';
import { protractor } from 'protractor/built/ptor';

export class CommonPage {
  navigateTo(url: string) {
    return browser.get(url);
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  getTitle() {
    return browser.getTitle();
  }

  getToken() {
    return browser.executeScript('return window.localStorage.token');
  }

  deleteToken() {
    return browser.executeScript('window.localStorage.clear();');
  }

  presentEnabledElementClick(name: string, text: string, rowNum: number) {
    return this.waitElementUntilPresent(name, text, rowNum)
      .then(() => this.waitElementUntilEnabled(name, text, rowNum))
      .then(() => wait(200))
      .then(() =>
        browser.wait(
          () => clickTrue(this.getElementByNameAndText(name, text, rowNum)),
          appearTime
        )
      );
  }

  getElementByNameAndText(
    name: string,
    text: string,
    rowNum: number
  ): ElementFinder {
    return element
      .all(by.name(name))
      .filter((elem, index) => elem.getText().then(t => t === text))
      .get(rowNum);
    // .first();
  }

  waitElementUntilPresent(name: string, text: string, rowNum: number) {
    return browser.wait(
      () => this.getElementByNameAndText(name, text, rowNum).isPresent(),
      appearTime
    );
  }

  waitElementUntilEnabled(name: string, text: string, rowNum: number) {
    return browser.wait(
      () => this.getElementByNameAndText(name, text, rowNum).isEnabled(),
      appearTime
    );
  }

  waitUntilPresent(name: string, rowNum: number) {
    return browser.wait(
      () =>
        element
          .all(by.name(name))
          .get(rowNum)
          .isPresent(),
      appearTime
    );
  }

  waitUntilEnabled(name: string, rowNum: number) {
    return browser.wait(
      () =>
        element
          .all(by.name(name))
          .get(rowNum)
          .isEnabled(),
      appearTime
    );
  }

  presentEnabledClick(name: string, rowNum: number) {
    return this.waitUntilPresent(name, rowNum)
      .then(() => this.waitUntilEnabled(name, rowNum))
      .then(() => wait(200))
      .then(() =>
        browser.wait(
          () => clickTrue(element.all(by.name(name)).get(rowNum)),
          appearTime
        )
      );
  }

  presentEnabledClickHidden(name: string, rowNum: number) {
    return this.waitUntilPresent(name, rowNum)
      .then(() => this.waitUntilEnabled(name, rowNum))
      .then(() =>
        browser.executeScript(
          'arguments[0].click();',
          element
            .all(by.name(name))
            .get(rowNum)
            .getWebElement()
        )
      );
  }

  getIsChecked(name: string, rowNum: number) {
    return this.waitUntilPresent(name, rowNum).then(() =>
      element
        .all(by.name(name))
        .get(rowNum)
        .isSelected()
    );
  }

  getIsEnabled(name: string, rowNum: number) {
    return this.waitUntilPresent(name, rowNum).then(() =>
      element
        .all(by.name(name))
        .get(rowNum)
        .isEnabled()
    );
  }

  getElementsLength(name: string) {
    return element.all(by.name(name)).then(els => els.length);
  }

  getAttribute(name: string, rowNum: number, atrName: string) {
    return this.waitUntilPresent(name, rowNum).then(() =>
      element
        .all(by.name(name))
        .get(rowNum)
        .getAttribute(atrName)
    );
  }

  enterText(text: string, name: string, rowNum: number) {
    return this.waitUntilPresent(name, rowNum)
      .then(() => element.all(by.name(name)).get(rowNum))
      .then(el => {
        el.clear();
        return el.sendKeys(text);
      });
  }

  setElementValue(text: string, name: string) {
    return this.waitUntilPresent(name, 0)
      .then(() => element(by.name(name)))
      .then(el => {
        el.clear();
        return browser
          .executeScript(
            `document.getElementsByName('${name}')[0].value = ${text}`
          )
          .then(() =>
            el.sendKeys(protractor.Key.SPACE, protractor.Key.BACK_SPACE)
          ); // to make angular check value
      });
  }

  sendKeysToEditor(text: string) {
    let aceContentElement = element(by.css('div.ace_content'));
    let aceTextarea = element(by.css('ace-editor textarea'));
    let aceTextInputElement = element(by.css('textarea.ace_text-input'));

    return (
      browser
        .wait(() => aceContentElement.isPresent(), appearTime)
        .then(() => browser.wait(() => aceTextarea.isPresent(), appearTime))
        .then(() =>
          browser
            .actions()
            .mouseMove(aceContentElement)
            .click()
            .perform()
        )
        .then(() =>
          aceTextInputElement.sendKeys(
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.ARROW_RIGHT,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE,
            protractor.Key.BACK_SPACE
          )
        )
        // .then(() => aceTextInputElement.sendKeys(protractor.Key.NULL))
        // .then(() => aceTextInputElement.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a')))
        // .then(() => aceTextarea.clear())
        .then(() => aceTextInputElement.sendKeys(text))
      // .then(() => browser.sleep(12000))
    );
  }
}
