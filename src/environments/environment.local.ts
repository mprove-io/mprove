import * as interfaces from 'app/interfaces/_index';
import * as enums from 'app/enums/_index';

export const environment: interfaces.Environment = {
  appName: 'Mprove',
  envName: enums.EnvNameEnum.LOCAL,

  local: true,
  production: false,
  test: false,

  canUseRaven: false,
  canClickOkOnErrorDialog: true,
  canPrintToConsole: true,
  canUseStoreLogger: false,
  canUseStoreFreeze: false,
  canUseSegmentMetaReducer: false,

  dynamicAssetsBaseUrl: 'http://localhost:8080',
  httpUrl: 'http://localhost:8080/api/v1',
  websocketUrl: 'ws://localhost:8080/api/v1/webchat/',
};
