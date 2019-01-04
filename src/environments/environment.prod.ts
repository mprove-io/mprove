import * as interfaces from 'app/interfaces/_index';
import * as enums from 'app/enums/_index';

const packageJson = require('../../package.json');

export const environment: interfaces.Environment = {
  appName: 'Mprove',
  envName: enums.EnvNameEnum.PROD,

  local: false,
  production: true,
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

  i18nPrefix: '/angular-ngrx-material-starter',
  versions: {
    app: packageJson.version,
    angular: packageJson.dependencies['@angular/core'],
    ngrx: packageJson.dependencies['@ngrx/store'],
    material: packageJson.dependencies['@angular/material'],
    bootstrap: packageJson.dependencies.bootstrap,
    rxjs: packageJson.dependencies.rxjs,
    fontAwesome:
      packageJson.dependencies['@fortawesome/fontawesome-free-webfonts'],
    angularCli: packageJson.devDependencies['@angular/cli'],
    typescript: packageJson.devDependencies['typescript'],
    cypress: packageJson.devDependencies['cypress']
  }
};
