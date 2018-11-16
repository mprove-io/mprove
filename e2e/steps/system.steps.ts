import { expect } from 'chai';
import { browser } from 'protractor';
import { CommonPage } from '../po/common.po';
import { appearTime, waitTime } from '../e2e.config';
import { HttpE } from '../http-e';

const { Before, Given, Then, setDefaultTimeout } = require('cucumber');

let httpE: HttpE;

Before(() => {
  httpE = new HttpE();
});

Given('[system] I check if testing enabled', () => {
  setDefaultTimeout(60 * 1000); // for clean step
  return httpE.isEnableE2e();
});

Given('[system] I clean data', () => httpE.clean());

Given('[system] I start testing', () => {
  setDefaultTimeout(waitTime); // after clean step
  return httpE.start();
});

Given('[system] I finish testing', () => {
  return httpE.finish();
});
