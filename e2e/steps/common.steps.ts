import { expect } from 'chai';
import { browser } from 'protractor';
import { CommonPage } from '../po/common.po';
import { appearTime, waitTime } from '../e2e.config';
import { consoleMessage } from '../utils';

const { Before, Given, Then, setDefaultTimeout } = require('cucumber');

setDefaultTimeout(waitTime);

let commonPage: CommonPage;

Before(() => {
  commonPage = new CommonPage();
});

Given(/^\[common\] scenario '(.*)'$/, (sc: string) => consoleMessage(sc));

Then(/^\[common\] I wait "?([^"]*)"? seconds$/, (time: number) =>
  browser.sleep(time * 1000)
);

Then(/^\[common\] I go to '(.*)'$/, (urlEx: string) =>
  commonPage.navigateTo(urlEx)
);

Then(/^\[common\] I am on page with url '(.*)'$/, (urlEx: string) =>
  browser.wait(
    () => commonPage.getUrl().then(url => url.split('4201')[1] === urlEx),
    appearTime
  )
);

Then('[common] I delete token', () => commonPage.deleteToken());

// Then(
//   /^\[common\] I enter '(.+)' into '(.+)'$/,
//   (text: string, name: string) => commonPage.enterText(text, name, 0)
// );

Then(
  /^\[common\] I enter json into field '(.+)' value$/,
  (name: string, json: string) =>
    commonPage.setElementValue(JSON.stringify(json), name)
);

Then(/^\[common\] I enter text into editor$/, (text: string) =>
  commonPage.sendKeysToEditor(text)
);

Then('[common] My token ready', () =>
  browser.wait(
    () => commonPage.getToken().then(token => token !== null),
    appearTime
  )
);

Then(/^\[common\] I am redirected to page with url '(.*)'$/, (urlEx: string) =>
  browser.wait(
    () => commonPage.getUrl().then(url => url.split('4201')[1] === urlEx),
    appearTime
  )
);

Then(/^\[common\] Page title should be '(.*)'$/, (titleEx: string) =>
  browser.wait(
    () => commonPage.getTitle().then(title => title === titleEx),
    appearTime
  )
);

Then('[common] I should see empty token', () =>
  commonPage.getToken().then(token => expect(token).to.be.equal(null))
);

Then(
  /^\[common\] Elements '(.+)' length should be '(.+)'$/,
  (name: string, value: string) =>
    browser.wait(
      () =>
        commonPage
          .getElementsLength(name)
          .then(length => length.toString().trim() === value),
      appearTime
    )
);

// Field

Then(
  /^\[common\] Field '(.+)' row '(.+)' attribute '(.+)' should be empty$/,
  (name: string, row: string, atrName: string) =>
    browser.wait(
      () =>
        commonPage
          .getAttribute(name, Number(row), atrName)
          .then(text => text.toString().trim() === ''),
      appearTime
    )
);

Then(
  /^\[common\] Field '(.+)' row '(.+)' attribute '(.+)' should be '(.+)'$/,
  (name: string, row: string, atrName: string, value: string) =>
    browser.wait(
      () =>
        commonPage
          .getAttribute(name, Number(row), atrName)
          .then(text => text.toString().trim() === value),
      appearTime
    )
);

Then(
  /^\[common\] Field '(.+)' row '(.+)' attribute '(.+)' should be text$/,
  (name: string, row: string, atrName: string, text: string) =>
    browser.wait(
      () =>
        commonPage
          .getAttribute(name, Number(row), atrName)
          .then(v => v.toString().trim() === text),
      appearTime
    )
);

// Then(
//   /^\[common\] Field '(.+)' row '(.+)' attribute '(.+)' expected to be text$/,
//   (name: string, row: string, atrName: string, text: string) =>
//     commonPage.getAttribute(name, Number(row), atrName).then(v => {
//       console.log(v.toString().trim());
//       expect(v.toString().trim().replace(/(\s|\r\n\t|\n|\r\t)/gm, ''))
//         .to.be.equal(text.replace(/(\s|\r\n\t|\n|\r\t)/gm, ''));
//     })
// );

Then(
  /^\[common\] Field '(.+)' row '(.+)' should be enabled$/,
  (name: string, row: string) =>
    browser.wait(() => commonPage.getIsEnabled(name, Number(row)), appearTime)
);

Then(
  /^\[common\] Field '(.+)' row '(.+)' should be disabled$/,
  (name: string, row: string) =>
    browser.wait(
      () => commonPage.getIsEnabled(name, Number(row)).then(x => !x),
      appearTime
    )
);

Then(
  /^\[common\] I wait until field '(.+)' row '(.+)' is present$/,
  (name: string, row: string) => commonPage.waitUntilPresent(name, Number(row))
);

Then(
  /^\[common\] I click hidden field '(.+)' row '(.+)'$/,
  (name: string, row: string) =>
    commonPage.presentEnabledClickHidden(name, Number(row))
);

Then(
  /^\[common\] I click field '(.+)' row '(.+)'$/,
  (name: string, row: string) =>
    commonPage.presentEnabledClick(name, Number(row))
);

Then(
  /^\[common\] I click field '(.+)' with text '(.+)'$/,
  (name: string, text: string) =>
    commonPage.presentEnabledElementClick(name, text, 0)
);

// Then(
//   /^\[common\] A - I click field '(.+)' with text '(.+)' row '(.+)'$/,
//   (name: string, text: string, row: string) => commonPage.presentEnabledElementClick(name, text, Number(row))
// );

Then(/^\[common\] I click '(.*)'$/, (name: string) =>
  commonPage.presentEnabledClick(name, 0)
);

Then(
  /^\[common\] I enter '(.+)' into '(.+)' row '(.+)'$/,
  (text: string, name: string, row: string) =>
    commonPage.enterText(text, name, Number(row))
);

// Flag

Then(
  /^\[common\] Flag '(.+)' row '(.+)' attribute '(.+)' should be '(.+)'$/,
  (name: string, row: string, atrName: string, value: string) =>
    browser.wait(
      () =>
        commonPage
          .getAttribute(name, (Number(row) + 1) * 2 - 1, atrName)
          .then(text => text.toString() === value),
      appearTime
    )
);

Then(
  /^\[common\] Flag '(.+)' row '(.+)' should be checked$/,
  (name: string, row: string) =>
    browser.wait(
      () => commonPage.getIsChecked(name, (Number(row) + 1) * 2 - 1),
      appearTime
    )
);

Then(
  /^\[common\] Flag '(.+)' row '(.+)' should be unchecked$/,
  (name: string, row: string) =>
    browser.wait(
      () =>
        commonPage.getIsChecked(name, (Number(row) + 1) * 2 - 1).then(x => !x),
      appearTime
    )
);

Then(
  /^\[common\] Flag '(.+)' row '(.+)' should be enabled$/,
  (name: string, row: string) =>
    browser.wait(
      () => commonPage.getIsEnabled(name, (Number(row) + 1) * 2 - 1),
      appearTime
    )
);

Then(
  /^\[common\] Flag '(.+)' row '(.+)' should be disabled$/,
  (name: string, row: string) =>
    browser.wait(
      () =>
        commonPage.getIsEnabled(name, (Number(row) + 1) * 2 - 1).then(x => !x),
      appearTime
    )
);

Then(
  /^\[common\] I click flag '(.+)' row '(.+)'$/,
  (name: string, row: string) =>
    commonPage.presentEnabledClick(name, (Number(row) + 1) * 2 - 2)
);
