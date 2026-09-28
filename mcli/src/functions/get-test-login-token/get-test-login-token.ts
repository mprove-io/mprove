import type { ToBackendLoginUserOutput } from '#common/zod/backend/routes/users/login-user/login-user-output';
import type { ToBackendLoginUserRequest } from '#common/zod/backend/routes/users/login-user/login-user-request';
import { mreq } from '#mcli/functions/mreq/mreq';

export async function getTestLoginToken(item: {
  email: string;
  password: string;
  host: string;
}): Promise<string> {
  let loginUserReqPayload: ToBackendLoginUserRequest['input'] = {
    email: item.email,
    password: item.password
  };

  let loginUserOutput: ToBackendLoginUserOutput = await mreq({
    route: 'api/ToBackendLoginUser',
    payload: loginUserReqPayload,
    host: item.host
  });

  let token: string = loginUserOutput.token;

  return token;
}
