import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { sendToMcp } from '#backend/functions/send-to-mcp';
import { Prep } from '#backend/interfaces/prep';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendGenerateUserApiKeyRequest,
  ToBackendGenerateUserApiKeyResponse
} from '#common/interfaces/to-backend/users/to-backend-generate-user-api-key';

let testId = 'backend-mcp__api-key-not-valid';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

let prep: Prep;

test('1', async t => {
  let response: any;

  try {
    prep = await prepareTestAndSeed({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email]
      },
      seedRecordsPayload: {
        users: [
          {
            email: email,
            password: password,
            isEmailVerified: true
          }
        ]
      },
      loginUserPayload: { email: email, password: password }
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

    let parts = generateResp.payload.apiKey.split('-');
    parts[parts.length - 1] = 'wrongsecret1234567890abcdef1234567890abcdef';
    let wrongApiKey = parts.join('-');

    response = await sendToMcp({
      httpServer: prep.httpServer,
      method: 'tools/list',
      apiKey: wrongApiKey
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

  t.is(response.status, 400);
  t.is(response.body.jsonrpc, '2.0');
  t.is(response.body.error.code, -32600);
  t.is(response.body.error.message, ErEnum.BACKEND_API_KEY_NOT_VALID);
});
