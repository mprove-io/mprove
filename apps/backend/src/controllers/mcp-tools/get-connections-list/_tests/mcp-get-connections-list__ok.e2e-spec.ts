import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-seed/prepare-seed';
import { prepareTest } from '#backend/functions/top/prepare-test-and-seed/prepare-test/prepare-test';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import { sendToMcp } from '#backend/functions/top/send-to-mcp/send-to-mcp';
import { PrepTest } from '#backend/interfaces/prep-test';
import { MCP_TOOL_GET_CONNECTIONS_LIST } from '#common/constants/mcp-tools-registry';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendSeedRecordsInputConnectionsItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-connections-item';
import type { ToBackendGenerateUserApiKeyRequest } from '#common/types/backend/routes/users/generate-user-api-key/generate-user-api-key-request';

let testId = 'backend-mcp-get-connections-list__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let seedProjectId = 't1';
let projectId = makeId();
let projectName = testId;

test('1', async t => {
  let isPass: boolean;
  let prepTest: PrepTest;

  await retry(async (bail: any) => {
    let response: any;

    try {
      prepTest = await prepareTest({});

      let c1Postgres: ToBackendSeedRecordsInputConnectionsItem = {
        envId: PROJECT_ENV_PROD,
        projectId: projectId,
        connectionId: 'c1_postgres',
        type: 'PostgreSQL',
        options: {
          postgres: {
            host: prepTest.cs.get<BackendConfig['demoProjectDwhPostgresHost']>(
              'demoProjectDwhPostgresHost'
            ),
            port: 5436,
            username: prepTest.cs.get<
              BackendConfig['demoProjectDwhPostgresUser']
            >('demoProjectDwhPostgresUser'),
            password: prepTest.cs.get<
              BackendConfig['demoProjectDwhPostgresPassword']
            >('demoProjectDwhPostgresPassword'),
            database: 'p_db',
            isSSL: false
          }
        }
      };

      let prepareSeedResult = await prepareSeed({
        httpServer: prepTest.httpServer,
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email],
          orgIds: [orgId],
          projectIds: [projectId],
          projectNames: [projectName]
        },
        seedRecordsPayload: {
          users: [
            {
              userId: userId,
              email: email,
              password: password,
              isEmailVerified: true
            }
          ],
          orgs: [
            {
              orgId: orgId,
              ownerEmail: email,
              name: orgName
            }
          ],
          projects: [
            {
              orgId: orgId,
              projectId: projectId,
              seedProjectId: seedProjectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: 'Managed'
            }
          ],
          members: [
            {
              memberId: userId,
              email: email,
              projectId: projectId,
              isAdmin: true,
              isEditor: true,
              isExplorer: true
            }
          ],
          connections: [c1Postgres]
        },
        loginUserPayload: { email: email, password: password }
      });

      let generateReq: ToBackendGenerateUserApiKeyRequest = {
        operation: 'generateUserApiKey',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {}
      };

      let generateResp = await sendToBackend({
        route: 'api/ToBackendGenerateUserApiKey',
        httpServer: prepTest.httpServer,
        loginToken: prepareSeedResult.loginToken,
        req: generateReq,
        checkIsOk: true
      });

      response = await sendToMcp({
        httpServer: prepTest.httpServer,
        method: 'tools/call',
        params: {
          name: MCP_TOOL_GET_CONNECTIONS_LIST,
          arguments: {
            projectId: projectId,
            envId: PROJECT_ENV_PROD
          }
        },
        apiKey: unwrapBackendResponseOutput({ response: generateResp }).apiKey
      });

      await prepTest.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
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
    assert.ok(Array.isArray(structuredContent.connectionItems));

    let postgresItem = structuredContent.connectionItems.find(
      (x: any) => x.connectionId === 'c1_postgres'
    );
    assert.notEqual(postgresItem, undefined);
    assert.equal(postgresItem.type, 'PostgreSQL');

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: 'Error',
      logger: prepTest?.logger,
      cs: prepTest?.cs
    });
  });

  t.is(isPass, true);
});
