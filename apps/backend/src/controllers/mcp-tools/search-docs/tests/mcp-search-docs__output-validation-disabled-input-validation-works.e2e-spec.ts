import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import type { Response } from 'supertest';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { sendToMcp } from '#backend/functions/send-to-mcp';
import type { PrepTest } from '#backend/interfaces/prep-test';
import { MCP_TOOL_SEARCH_DOCS } from '#common/constants/mcp-tools-registry';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendGenerateUserApiKeyRequest } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-request';
import type { ToBackendGenerateUserApiKeyResponse } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-response';

let testId =
  'backend-mcp-search-docs__output-validation-disabled-input-validation-works';

let traceId = testId;

let userId: string = makeId();

let email = `${testId}@example.com`;

let password = '123456';

test('1', async t => {
  let isPass: boolean = false;

  await retry(async () => {
    let prepTest: PrepTest;

    try {
      prepTest = await prepareTest({
        mcpOptions: {
          isValidateResponse: false
        }
      });

      let prepareSeedResult: { loginToken?: string } = await prepareSeed({
        httpServer: prepTest.httpServer,
        traceId: traceId,
        deleteRecordsPayload: { emails: [email] },
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
        operation: 'generateUserApiKey',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {}
      };

      let generateResp: ToBackendGenerateUserApiKeyResponse =
        await sendToBackend({
          route: 'api/ToBackendGenerateUserApiKey',
          httpServer: prepTest.httpServer,
          loginToken: prepareSeedResult.loginToken,
          req: generateReq,
          checkIsOk: true
        });

      let apiKey: string = unwrapBackendResponseOutput({
        response: generateResp
      }).apiKey;

      let response: Response = await sendToMcp({
        httpServer: prepTest.httpServer,
        method: 'tools/call',
        params: { name: MCP_TOOL_SEARCH_DOCS, arguments: { query: 123 } },
        apiKey: apiKey,
        protocolVersion: '2026-07-28'
      });

      assert.equal(response.status, 200);

      assert.equal(response.body.error, undefined);

      assert.equal(response.body.result.isError, true);

      assert.match(
        response.body.result.content[0].text,
        /Invalid parameters:.*query/
      );
    } catch (error) {
      logToConsoleBackend({
        log: error,
        logLevel: LogLevelEnum.Error,
        logger: prepTest?.logger,
        cs: prepTest?.cs
      });

      throw error;
    } finally {
      if (isDefined(prepTest)) {
        await prepTest.app.close();
      }
    }

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS);

  t.is(isPass, true);
});
