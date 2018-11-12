export const environment = {
  appName: 'Mprove',
  envName: 'LOCAL',

  local: true,
  production: false,
  test: false,

  canUseRaven: false,
  canClickOkOnErrorDialog: true,
  canPrintToConsole: true,
  canUseStoreLogger: false,
  canUseStoreFreeze: false,
  canUseSegmentMetaReducer: false,

  staticAssetsBaseUrl: 'http://localhost:8080',
  dynamicAssetsBaseUrl: 'http://localhost:8080',
  httpUrl: 'http://localhost:8080/api/v1',
  websocketUrl: 'ws://localhost:8080/api/v1/webchat/',
};