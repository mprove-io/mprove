import * as interfaces from '@app/interfaces/_index';
import * as enums from '@app/enums/_index';

export const environment: interfaces.Environment = {
  dev: false,
  local: true,
  test: false,
  production: false,

  canClickOkOnErrorDialog: true,
  canPrintToConsole: true,
  canUseStoreLogger: false,
  canUseStoreFreeze: false,
  canUseRaven: false
};
