import { expect } from 'chai';
import { browser } from 'protractor';
import { CommonPage } from '../po/common.po';
import { appearTime } from '../e2e.config';
import { ModelPage } from '../po/model.po';

const { Before, Given, Then } = require('cucumber');

let modelPage: ModelPage;

Before(() => {
  modelPage = new ModelPage();
});
