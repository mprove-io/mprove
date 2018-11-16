import { expect } from 'chai';
import { browser } from 'protractor';
import { CommonPage } from '../po/common.po';
import { appearTime } from '../e2e.config';
import { TeamPage } from '../po/team.po';

const { Before, Given, Then } = require('cucumber');

let teamPage: TeamPage;

Before(() => {
  teamPage = new TeamPage();
});
