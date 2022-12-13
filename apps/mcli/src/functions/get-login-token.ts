import { apiToBackend } from '~mcli/barrels/api-to-backend';
import { common } from '~mcli/barrels/common';
import { CustomContext } from '~mcli/models/custom-command';
import { mreq } from './mreq';

export async function getLoginToken(context: CustomContext) {
  if (common.isDefined(context?.loginToken)) {
    return context.loginToken;
  }

  let loginUserReqPayload: apiToBackend.ToBackendLoginUserRequestPayload = {
    email: context.config.mproveCliEmail,
    password: context.config.mproveCliPassword
  };

  let loginUserResp = await mreq<apiToBackend.ToBackendLoginUserResponse>({
    pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
    payload: loginUserReqPayload,
    host: context.config.mproveCliHost
  });

  return loginUserResp.payload.token;
}
