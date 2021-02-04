import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export function getCommonConfig(envFile) {
  let commonConfig: interfaces.Config = {
    mproveLogIsColor: <enums.BoolEnum>envFile.MPROVE_LOG_IS_COLOR,
    mproveLogResponseError: <enums.BoolEnum>envFile.MPROVE_LOG_RESPONSE_ERROR,
    mproveLogResponseOk: <enums.BoolEnum>envFile.MPROVE_LOG_RESPONSE_OK,
    mproveLogOnSender: <enums.BoolEnum>envFile.MPROVE_LOG_ON_SENDER,
    mproveLogOnResponser: <enums.BoolEnum>envFile.MPROVE_LOG_ON_RESPONSER
  };
  return commonConfig;
}
