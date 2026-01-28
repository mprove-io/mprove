import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendLoginUserRequestPayload,
  ToBackendLoginUserResponse
} from '#common/interfaces/to-backend/users/to-backend-login-user';
import { CustomContext } from '~mcli/models/custom-command';
import { mreq } from './mreq';

export async function getLoginToken(context: CustomContext) {
  if (isDefined(context?.loginToken)) {
    return context.loginToken;
  }

  let loginUserReqPayload: ToBackendLoginUserRequestPayload = {
    email: context.config.mproveCliEmail,
    password: context.config.mproveCliPassword
  };

  let loginUserResp = await mreq<ToBackendLoginUserResponse>({
    pathInfoName: ToBackendRequestInfoNameEnum.ToBackendLoginUser,
    payload: loginUserReqPayload,
    host: context.config.mproveCliHost
  });

  return loginUserResp.payload.token;
}
