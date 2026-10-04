import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import type { Response } from 'supertest';
import { mockMcpSearchDocsOutput } from '#backend/controllers/mcp-tools/search-docs/tests/fixtures/mock-mcp-search-docs-output';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { sendToMcp } from '#backend/functions/send-to-mcp';
import type { PrepTest } from '#backend/interfaces/prep-test';
import { MCP_TOOL_SEARCH_DOCS } from '#common/constants/mcp-tools-registry';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendGenerateUserApiKeyRequest } from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-request';
import type { ToBackendGenerateUserApiKeyResponse } from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-response';

let testId = 'backend-mcp-search-docs__output-validation-enabled';

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
          isValidateResponse: true
        }
      });

      mockMcpSearchDocsOutput({ prepTest: prepTest });

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
        params: { name: MCP_TOOL_SEARCH_DOCS, arguments: { query: 'mprove' } },
        apiKey: apiKey,
        protocolVersion: '2026-07-28'
      });

      assert.equal(response.body.error?.code, -32603);

      assert.match(
        response.body.error?.message,
        /Tool result does not match outputSchema:.*searchDocsResults/
      );

      assert.equal(response.body.result, undefined);
    } catch (error) {
      logToConsoleBackend({
        log: error,
        logLevel: 'Error',
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
