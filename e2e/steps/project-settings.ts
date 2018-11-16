import { expect } from 'chai';
import { browser } from 'protractor';
import { CommonPage } from '../po/common.po';
import { appearTime } from '../e2e.config';
import { ProjectSettingsPage } from '../po/project-settings.po';

const { Before, Given, Then } = require('cucumber');

let projectSettingsPage: ProjectSettingsPage;

Before(() => {
  projectSettingsPage = new ProjectSettingsPage();
});
