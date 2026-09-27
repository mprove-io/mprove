import type { ToBackendLoginUserInput } from '#common/zod/backend/routes/users/login-user/login-user-request';
import type { ToBackendLoginUserOutput } from '#common/zod/backend/routes/users/login-user/login-user-response';
import { mreq } from '#mcli/functions/mreq/mreq';

export async function getTestLoginToken(item: {
  email: string;
  password: string;
  host: string;
}): Promise<string> {
  let loginUserReqPayload: ToBackendLoginUserInput = {
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
