import { enums } from '~common/barrels/enums';
import { Config } from '~common/interfaces/_index';

export function getCommonConfig(env: any) {
  let commonConfig: Config = {
    mproveLogIsColor: <enums.BoolEnum>env.MPROVE_LOG_IS_COLOR,
    mproveLogResponseError: <enums.BoolEnum>env.MPROVE_LOG_RESPONSE_ERROR,
    mproveLogResponseOk: <enums.BoolEnum>env.MPROVE_LOG_RESPONSE_OK,
    mproveLogOnSender: <enums.BoolEnum>env.MPROVE_LOG_ON_SENDER,
    mproveLogOnResponser: <enums.BoolEnum>env.MPROVE_LOG_ON_RESPONSER
  };
  return commonConfig;
}
