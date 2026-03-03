import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendGetRepoRequest,
  ToBackendGetRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-get-repo';
import {
  ToBackendGenerateUserApiKeyRequest,
  ToBackendGenerateUserApiKeyResponse
} from '#common/interfaces/to-backend/users/to-backend-generate-user-api-key';

let testId = 'backend-jwt-auth-guard__api-key-not-valid';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
  let resp: ToBackendGetRepoResponse;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            email,
            password,
            isEmailVerified: true
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let generateReq: ToBackendGenerateUserApiKeyRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGenerateUserApiKey,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {}
    };

    let generateResp = await sendToBackend<ToBackendGenerateUserApiKeyResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: generateReq,
        checkIsOk: true
      }
    );

    let req: ToBackendGetRepoRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendGetRepo,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: {
        projectId: 'unk',
        repoId: 'unk',
        branchId: BRANCH_MAIN,
        envId: PROJECT_ENV_PROD,
        isFetch: false
      }
    };

    let parts = generateResp.payload.apiKey.split('-');
    parts[parts.length - 1] = 'wrongsecret1234567890abcdef1234567890abcdef';
    let wrongApiKey = parts.join('-');

    resp = await sendToBackend<ToBackendGetRepoResponse>({
      httpServer: prep.httpServer,
      apiKey: wrongApiKey,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: prep.logger,
      cs: prep.cs
    });
  }

  t.is(resp.info.status, ResponseInfoStatusEnum.Error);
  t.is(resp.info.error.message, ErEnum.BACKEND_API_KEY_NOT_VALID);
});
