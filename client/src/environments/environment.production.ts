import * as interfaces from '@app/interfaces/_index';
import * as enums from '@app/enums/_index';

const packageJson = require('../../package.json');

export const environment: interfaces.Environment = {
  dev: false,
  local: false,
  production: true,
  test: false,

  canClickOkOnErrorDialog: false,
  canPrintToConsole: false,
  // canUseStoreLogger: false,
  canUseStoreFreeze: false
};
