import assert from 'node:assert/strict';
import {
  fromJsonSchema,
  type JsonSchemaType,
  type StandardSchemaV1
} from '@modelcontextprotocol/server';
import retry from 'async-retry';
import test from 'ava';
import type { Response } from 'supertest';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { sendToMcp } from '#backend/functions/send-to-mcp';
import type { PrepTest } from '#backend/interfaces/prep-test';
import {
  MCP_TOOL_READ_DOCS,
  MCP_TOOL_SEARCH_DOCS,
  mcpToolsRegistry
} from '#common/constants/mcp-tools-registry';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendGenerateUserApiKeyRequest } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-request';
import type { ToBackendGenerateUserApiKeyResponse } from '#common/zod/backend/routes/users/generate-user-api-key/generate-user-api-key-response';

type ListedTool = {
  name: string;
  outputSchema: Record<string, unknown>;
};

let testId = 'backend-mcp-tools__output-schemas';

let traceId = testId;

let userId: string = makeId();

let email = `${testId}@example.com`;

let password = '123456';

test('1', async t => {
  let isPass: boolean = false;

  await retry(async () => {
    let prepTest: PrepTest;

    try {
      prepTest = await prepareTest({});

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

      let legacyResponse: Response = await sendToMcp({
        httpServer: prepTest.httpServer,
        method: 'tools/list',
        apiKey: apiKey
      });

      let modernResponse: Response = await sendToMcp({
        httpServer: prepTest.httpServer,
        method: 'tools/list',
        apiKey: apiKey,
        protocolVersion: '2026-07-28'
      });

      [legacyResponse, modernResponse].forEach(response => {
        assert.equal(response.status, 200);

        assert.equal(response.body.error, undefined);

        let listedTools: ListedTool[] = response.body.result.tools;

        assert.equal(listedTools.length, mcpToolsRegistry.length);

        mcpToolsRegistry.forEach(entry => {
          let listedTool: ListedTool = listedTools.find(
            tool => tool.name === entry.name
          );

          assert.ok(listedTool, entry.name);

          assert.ok(listedTool.outputSchema, `${entry.name} outputSchema`);

          assert.equal(listedTool.outputSchema.type, 'object');

          assert.equal(
            listedTool.outputSchema.$schema,
            'https://json-schema.org/draft/2020-12/schema'
          );
        });

        [MCP_TOOL_SEARCH_DOCS, MCP_TOOL_READ_DOCS].forEach(name => {
          let listedTool: ListedTool = listedTools.find(
            tool => tool.name === name
          );

          assert.ok(Array.isArray(listedTool.outputSchema.anyOf));
        });
      });

      let modernTools: ListedTool[] = modernResponse.body.result.tools;

      let searchTool: ListedTool = modernTools.find(
        tool => tool.name === MCP_TOOL_SEARCH_DOCS
      );

      let searchValidator: StandardSchemaV1 = fromJsonSchema(
        searchTool.outputSchema as JsonSchemaType
      );

      let searchSuccess: StandardSchemaV1.Result<unknown> =
        await searchValidator['~standard'].validate({
          ok: true,
          searchDocsResults: [{ pageId: 'intro', snippets: ['Mprove'] }]
        });

      assert.equal(searchSuccess.issues, undefined);

      let searchError: StandardSchemaV1.Result<unknown> = await searchValidator[
        '~standard'
      ].validate({
        ok: false,
        error: 'No query provided'
      });

      assert.equal(searchError.issues, undefined);

      let searchInvalid: StandardSchemaV1.Result<unknown> =
        await searchValidator['~standard'].validate({
          ok: true,
          searchDocsResults: 'not-an-array'
        });

      assert.ok(searchInvalid.issues);

      let readTool: ListedTool = modernTools.find(
        tool => tool.name === MCP_TOOL_READ_DOCS
      );

      let readValidator: StandardSchemaV1 = fromJsonSchema(
        readTool.outputSchema as JsonSchemaType
      );

      let readSuccess: StandardSchemaV1.Result<unknown> = await readValidator[
        '~standard'
      ].validate({
        ok: true,
        readDocsResults: [{ pageId: 'intro', content: 'Mprove' }]
      });

      assert.equal(readSuccess.issues, undefined);

      let readError: StandardSchemaV1.Result<unknown> = await readValidator[
        '~standard'
      ].validate({
        ok: false,
        error: 'Page not found'
      });

      assert.equal(readError.issues, undefined);

      let readInvalid: StandardSchemaV1.Result<unknown> = await readValidator[
        '~standard'
      ].validate({
        ok: true,
        readDocsResults: 'not-an-array'
      });

      assert.ok(readInvalid.issues);
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
