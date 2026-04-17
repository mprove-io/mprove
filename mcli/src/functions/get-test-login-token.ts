import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendLoginUserRequestPayload,
  ToBackendLoginUserResponse
} from '#common/zod/to-backend/users/to-backend-login-user';
import { mreq } from './mreq';

export async function getTestLoginToken(item: {
  email: string;
  password: string;
  host: string;
}): Promise<string> {
  let loginUserReqPayload: ToBackendLoginUserRequestPayload = {
    email: item.email,
    password: item.password
  };

  let loginUserResp = await mreq<ToBackendLoginUserResponse>({
    pathInfoName: ToBackendRequestInfoNameEnum.ToBackendLoginUser,
    payload: loginUserReqPayload,
    host: item.host
  });

  return loginUserResp.payload.token;
}
