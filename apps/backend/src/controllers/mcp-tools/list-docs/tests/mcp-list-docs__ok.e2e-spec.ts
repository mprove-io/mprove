import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { sendToMcp } from '#backend/functions/send-to-mcp';
import { PrepTest } from '#backend/interfaces/prep-test';
import {
  BACKEND_E2E_RETRY_OPTIONS,
  MCP_TOOL_LIST_DOCS
} from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendGenerateUserApiKeyRequest,
  ToBackendGenerateUserApiKeyResponse
} from '#common/zod/to-backend/users/to-backend-generate-user-api-key';

let testId = 'backend-mcp-list-docs__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prepTest: PrepTest;

  await retry(async (bail: any) => {
    let response: any;

    try {
      prepTest = await prepareTest({});

      let prepareSeedResult = await prepareSeed({
        httpServer: prepTest.httpServer,
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email]
        },
        seedRecordsPayload: {
          users: [
            {
              userId: userId,
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

      let generateResp =
        await sendToBackend<ToBackendGenerateUserApiKeyResponse>({
          httpServer: prepTest.httpServer,
          loginToken: prepareSeedResult.loginToken,
          req: generateReq,
          checkIsOk: true
        });

      response = await sendToMcp({
        httpServer: prepTest.httpServer,
        method: 'tools/call',
        params: {
          name: MCP_TOOL_LIST_DOCS,
          arguments: {}
        },
        apiKey: generateResp.payload.apiKey
      });

      await prepTest.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: prepTest?.logger,
        cs: prepTest?.cs
      });
      if (prepTest) {
        await prepTest.app.close();
      }
    }

    assert.equal(response.status, 200);
    assert.equal(response.body.error, undefined);
    assert.notEqual(response.body.result, undefined);
    assert.notEqual(response.body.result.isError, true);

    let structuredContent = response.body.result.structuredContent;
    assert.equal(structuredContent.ok, true);
    assert.ok(Array.isArray(structuredContent.pageIds));
    assert.ok(structuredContent.pageIds.length > 0);
    assert.equal(typeof structuredContent.pageIds[0], 'string');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prepTest?.logger,
      cs: prepTest?.cs
    });
  });

  t.is(isPass, true);
});
