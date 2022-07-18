import { enums } from '~common/barrels/enums';
import { Config } from '~common/interfaces/_index';

export function getCommonConfig(envFile: any) {
  let commonConfig: Config = {
    mproveLogIsColor: <enums.BoolEnum>(
      (process.env.MPROVE_LOG_IS_COLOR || envFile.MPROVE_LOG_IS_COLOR)
    ),
    mproveLogResponseError: <enums.BoolEnum>(
      (process.env.MPROVE_LOG_RESPONSE_ERROR ||
        envFile.MPROVE_LOG_RESPONSE_ERROR)
    ),
    mproveLogResponseOk: <enums.BoolEnum>(
      (process.env.MPROVE_LOG_RESPONSE_OK || envFile.MPROVE_LOG_RESPONSE_OK)
    ),
    mproveLogOnSender: <enums.BoolEnum>(
      (process.env.MPROVE_LOG_ON_SENDER || envFile.MPROVE_LOG_ON_SENDER)
    ),
    mproveLogOnResponser: <enums.BoolEnum>(
      (process.env.MPROVE_LOG_ON_RESPONSER || envFile.MPROVE_LOG_ON_RESPONSER)
    )
  };
  return commonConfig;
}
