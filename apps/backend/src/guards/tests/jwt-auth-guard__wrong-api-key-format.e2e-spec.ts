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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendGetStateRequest,
  ToBackendGetStateResponse
} from '#common/interfaces/to-backend/state/to-backend-get-state';

let testId = 'backend-jwt-auth-guard__wrong-api-key-format';

let traceId = testId;

let email = `${testId}@example.com`;
let password = '123456';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendGetStateResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email]
        },
        seedRecordsPayload: {
          users: [
            {
              email,
              password,
              isEmailVerified: true
            }
          ]
        }
      });

      // Use a key with wrong format (2 parts instead of 4)
      let badFormatKey = 'PK-WRONG-FORMAT';

      let req: ToBackendGetStateRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGetState,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: 'unk',
          repoId: 'unk',
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
        apiKey: badFormatKey,
        req: req
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
    assert.equal(resp.info.error.message, ErEnum.BACKEND_WRONG_API_KEY_FORMAT);

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
