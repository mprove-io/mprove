import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import { makeSessionId } from '#common/functions/make-session-id';
import type {
  ToBackendCommitRepoRequest,
  ToBackendCommitRepoResponse
} from '#common/zod/to-backend/repos/to-backend-commit-repo';
import { buildSessionApiKey } from '#node-common/functions/api-key/build-session-api-key';
import { generateApiKeyParts } from '#node-common/functions/api-key/generate-api-key-parts';

let testId = 'backend-jwt-auth-guard__session-key-request-not-allowed';

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
    let resp: ToBackendCommitRepoResponse;

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
              userId,
              email,
              password,
              isEmailVerified: true
            }
          ],
          orgs: [
            {
              orgId,
              name: orgName,
              ownerEmail: email
            }
          ],
          projects: [
            {
              orgId,
              projectId,
              name: projectName,
              remoteType: ProjectRemoteTypeEnum.Managed,
              defaultBranch: BRANCH_MAIN
            }
          ],
          members: [
            {
              memberId: userId,
              email,
              projectId,
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

      // not session-allowed
      let commitReq: ToBackendCommitRepoRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          repoId: sessionId,
          branchId: BRANCH_MAIN,
          commitMessage: 'test commit'
        }
      };

      resp = await sendToBackend<ToBackendCommitRepoResponse>({
        httpServer: prep.httpServer,
        apiKey: sessionApiKey,
        req: commitReq
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

    assert.equal(resp.info.status, ResponseInfoStatusEnum.Error);
    assert.equal(
      resp.info.error.message,
      ErEnum.BACKEND_SESSION_API_KEY_REQUEST_NOT_ALLOWED
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
