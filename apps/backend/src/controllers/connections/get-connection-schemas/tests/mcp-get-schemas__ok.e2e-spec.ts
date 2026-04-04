import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareSeed, prepareTest } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { sendToMcp } from '#backend/functions/send-to-mcp';
import { PrepTest } from '#backend/interfaces/prep-test';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import {
  BACKEND_E2E_RETRY_OPTIONS,
  MCP_TOOL_GET_SCHEMAS
} from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import { ToBackendSeedRecordsRequestPayloadConnectionsItem } from '#common/interfaces/to-backend/test-routes/to-backend-seed-records';
import {
  ToBackendGenerateUserApiKeyRequest,
  ToBackendGenerateUserApiKeyResponse
} from '#common/interfaces/to-backend/users/to-backend-generate-user-api-key';

let testId = 'backend-mcp-get-schemas__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = makeId();
let projectName = testId;

test('1', async t => {
  let isPass: boolean;
  let prepTest: PrepTest;

  await retry(async (bail: any) => {
    let response: any;

    try {
      prepTest = await prepareTest({});

      let c1Postgres: ToBackendSeedRecordsRequestPayloadConnectionsItem = {
        envId: PROJECT_ENV_PROD,
        projectId: projectId,
        connectionId: 'c1_postgres',
        type: ConnectionTypeEnum.PostgreSQL,
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
              testProjectId: testProjectId,
              name: projectName,
              defaultBranch: BRANCH_MAIN,
              remoteType: ProjectRemoteTypeEnum.Managed
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
          name: MCP_TOOL_GET_SCHEMAS,
          arguments: {
            projectId: projectId,
            envId: PROJECT_ENV_PROD,
            repoId: userId,
            branchId: BRANCH_MAIN,
            isRefreshExistingCache: false
          }
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
