import { expect } from 'chai';
import { browser } from 'protractor';
import { CommonPage } from '../po/common.po';
import { ProfilePage } from '../po/profile.po';
import { appearTime } from '../e2e.config';

const { Before, Given, Then } = require('cucumber');

let profilePage: ProfilePage;

Before(() => {
  profilePage = new ProfilePage();
});
