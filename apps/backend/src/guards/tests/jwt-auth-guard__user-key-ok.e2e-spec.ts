import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type {
  ToBackendGetStateRequest,
  ToBackendGetStateResponse
} from '#common/zod/to-backend/state/to-backend-get-state';
import type {
  ToBackendGenerateUserApiKeyRequest,
  ToBackendGenerateUserApiKeyResponse
} from '#common/zod/to-backend/users/to-backend-generate-user-api-key';

let testId = 'backend-jwt-auth-guard__user-key-ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendGetStateResponse;

    try {
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

      let generateResp =
        await sendToBackend<ToBackendGenerateUserApiKeyResponse>({
          httpServer: prep.httpServer,
          loginToken: prep.loginToken,
          req: generateReq,
          checkIsOk: true
        });

      let getStateReq: ToBackendGetStateRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGetState,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          repoId: userId,
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
      };

      resp = await sendToBackend<ToBackendGetStateResponse>({
        httpServer: prep.httpServer,
        apiKey: generateResp.payload.apiKey,
        req: getStateReq
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

    assert.equal(resp.info.error, undefined);
    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);

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
