// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import * as interfaces from 'app/interfaces/_index';
const packageJson = require('../../package.json');

import * as enums from 'app/enums/_index';
export const environment: interfaces.Environment = {
  dev: true,
  local: false,
  test: false,
  production: false,

  canClickOkOnErrorDialog: true,
  canPrintToConsole: true,
  canUseStoreLogger: false,
  canUseStoreFreeze: false,
  canUseRaven: false,
  canUseSegmentMetaReducer: false
};
