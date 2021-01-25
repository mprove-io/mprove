import * as apiEnums from '~/api/enums/_index';
import * as apiObjects from '~/api/objects/_index';

export function getCommonConfig(envFile) {
  let commonConfig: apiObjects.Config = {
    mproveLogIsColor: <apiEnums.BoolEnum>envFile.MPROVE_LOG_IS_COLOR,
    mproveLogResponseError: <apiEnums.BoolEnum>(
      envFile.MPROVE_LOG_RESPONSE_ERROR
    ),
    mproveLogResponseOk: <apiEnums.BoolEnum>envFile.MPROVE_LOG_RESPONSE_OK,
    mproveLogOnSender: <apiEnums.BoolEnum>envFile.MPROVE_LOG_ON_SENDER,
    mproveLogOnResponser: <apiEnums.BoolEnum>envFile.MPROVE_LOG_ON_RESPONSER
  };
  return commonConfig;
}
