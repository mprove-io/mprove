import * as interfaces from 'app/interfaces/_index';
import * as enums from 'app/enums/_index';

export const environment: interfaces.Environment = {
  appName: 'Mprove',
  envName: enums.EnvNameEnum.TEST,

  local: false,
  production: false,
  test: true,

  canUseRaven: false,
  canClickOkOnErrorDialog: false,
  canPrintToConsole: false,
  canUseStoreLogger: false,
  canUseStoreFreeze: false,
  canUseSegmentMetaReducer: false

  // dynamicAssetsBaseUrl: 'https://test.mprove.io',
  // httpUrl: 'https://test.mprove.io/api/v1',
  // websocketUrl: 'wss://test.mprove.io/api/v1/webchat/',
};
