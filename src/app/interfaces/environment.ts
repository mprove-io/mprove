import * as enums from 'app/enums/_index';

export interface Environment {
  dev: boolean;
  local: boolean;
  test: boolean;
  production: boolean;

  canUseRaven: boolean;
  canClickOkOnErrorDialog: boolean;
  canPrintToConsole: boolean;
  canUseStoreLogger: boolean;
  canUseStoreFreeze: boolean;
  canUseSegmentMetaReducer: boolean;

  // dynamicAssetsBaseUrl: string;
  // httpUrl: string;
  // websocketUrl: string;

  i18nPrefix?: string;
  versions?: any;
}
