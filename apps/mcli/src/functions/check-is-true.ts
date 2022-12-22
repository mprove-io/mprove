import { common } from '~mcli/barrels/common';

export function checkIsTrue(isPass: boolean) {
  if (isPass !== true) {
    let serverError = new common.ServerError({
      message: common.ErEnum.MCLI_TEST_ATTEMPT_FAIL,
      originalError: null
    });

    throw serverError;
  }

  return isPass;
}
