import * as interfaces from '@app/interfaces/_index';
import * as enums from '@app/enums/_index';

export const environment: interfaces.Environment = {
  dev: false,
  local: false,
  test: true,
  production: false,

  canClickOkOnErrorDialog: false,
  canPrintToConsole: false,
  canUseStoreLogger: false,
  canUseStoreFreeze: false,
  canUseRaven: false
};
