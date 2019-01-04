// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import * as interfaces from 'app/interfaces/_index';
const packageJson = require('../../package.json');

import * as enums from 'app/enums/_index';
export const environment: interfaces.Environment = {
  appName: 'Mprove',
  envName: enums.EnvNameEnum.DEV,

  local: false,
  production: false,
  test: false,

  canUseRaven: false,
  canClickOkOnErrorDialog: false,
  canPrintToConsole: false,
  canUseStoreLogger: false,
  canUseStoreFreeze: false,
  canUseSegmentMetaReducer: false,

  // dynamicAssetsBaseUrl: 'http://localhost:8080',
  // httpUrl: 'http://localhost:8080/api/v1',
  // websocketUrl: 'ws://localhost:8080/api/v1/webchat/',

  i18nPrefix: '',
  versions: {
    app: packageJson.version,
    angular: packageJson.dependencies['@angular/core'],
    ngrx: packageJson.dependencies['@ngrx/store'],
    material: packageJson.dependencies['@angular/material'],
    bootstrap: packageJson.dependencies.bootstrap,
    rxjs: packageJson.dependencies.rxjs,
    fontAwesome: packageJson.dependencies['@fortawesome/fontawesome-free'],
    angularCli: packageJson.devDependencies['@angular/cli'],
    typescript: packageJson.devDependencies['typescript'],
    cypress: packageJson.devDependencies['cypress']
  }
};
