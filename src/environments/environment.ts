// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=production` then `environment.production.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.
import * as interfaces from '@app/interfaces/_index';
const packageJson = require('../../package.json');

export const environment: interfaces.Environment = {
  dev: true,
  local: false,
  test: false,
  production: false,

  canClickOkOnErrorDialog: true,
  canPrintToConsole: true,
  canUseStoreLogger: true,
  canUseStoreFreeze: true,
  canUseRaven: false,
  canUseSegmentMetaReducer: false
};
