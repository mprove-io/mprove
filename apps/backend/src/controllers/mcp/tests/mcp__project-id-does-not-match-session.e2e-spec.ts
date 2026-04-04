import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToMcp } from '#backend/functions/send-to-mcp';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import {
  BACKEND_E2E_RETRY_OPTIONS,
  MCP_TOOL_GET_STATE
} from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { makeId } from '#common/functions/make-id';
import { makeSessionId } from '#common/functions/make-session-id';
import { buildSessionApiKey } from '#node-common/functions/api-key/build-session-api-key';
import { generateApiKeyParts } from '#node-common/functions/api-key/generate-api-key-parts';

let testId = 'backend-mcp__project-id-does-not-match-session';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let sessionId = makeSessionId();

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let response: any;

    try {
      let apiKeyParts = await generateApiKeyParts();

      let sessionApiKey = buildSessionApiKey({
        prefix: apiKeyParts.prefix,
        sessionId: sessionId,
        secret: apiKeyParts.secret
      });

      prep = await prepareTestAndSeed({
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
              name: orgName,
              ownerEmail: email
            }
          ],
          projects: [
            {
              orgId: orgId,
              projectId: projectId,
              name: projectName,
              remoteType: ProjectRemoteTypeEnum.Managed,
              defaultBranch: BRANCH_MAIN
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
          sessions: [
            {
              sessionId: sessionId,
              userId: userId,
              projectId: projectId,
              apiKey: sessionApiKey,
              apiKeyPrefix: apiKeyParts.prefix,
              apiKeySecretHash: apiKeyParts.secretHash,
              apiKeySalt: apiKeyParts.salt,
              status: SessionStatusEnum.Archived,
              type: SessionTypeEnum.Editor,
              repoId: sessionId,
              branchId: BRANCH_MAIN,
              envId: PROJECT_ENV_PROD
            }
          ]
        }
      });

      response = await sendToMcp({
        httpServer: prep.httpServer,
        method: 'tools/call',
        params: {
          name: MCP_TOOL_GET_STATE,
          arguments: {
            projectId: 'wrong-project-id',
            repoId: sessionId,
            branchId: BRANCH_MAIN,
            envId: PROJECT_ENV_PROD,
            isFetch: false,
            getErrors: false,
            getRepo: false,
            getRepoNodes: false,
            getModels: false,
            getDashboards: false,
            getCharts: false,
            getMetrics: false,
            getReports: false
          }
        },
        apiKey: sessionApiKey
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(response.status, 200);
    assert.equal(response.body.result.isError, true);
    let errorText = response.body.result.content[0].text;
    let errorObj = JSON.parse(errorText);
    assert.equal(
      errorObj.error,
      ErEnum.BACKEND_PROJECT_ID_DOES_NOT_MATCH_SESSION
    );

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: LogLevelEnum.Error,
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
