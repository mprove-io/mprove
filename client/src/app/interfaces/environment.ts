import * as enums from '@app/enums/_index';

export interface Environment {
  dev: boolean;
  local: boolean;
  test: boolean;
  production: boolean;

  canClickOkOnErrorDialog: boolean;
  canPrintToConsole: boolean;
  canUseStoreFreeze: boolean;

  i18nPrefix?: string;
  versions?: any;
}
