import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { GivenTypeEnum } from '#common/enums/given-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendCreateGivenRequest } from '#common/zod/backend/routes/givens/create-given/create-given-request';
import type { ToBackendEditGivenRequest } from '#common/zod/backend/routes/givens/edit-given/edit-given-request';
import type {
  ToBackendEditGivenOutput,
  ToBackendEditGivenResponse
} from '#common/zod/backend/routes/givens/edit-given/edit-given-response';

let testId = 'backend-edit-given__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let givenId = 'GIVEN_ONE';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendEditGivenResponse;

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
          ]
        },
        loginUserPayload: { email: email, password: password }
      });
      let createReq: ToBackendCreateGivenRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          givenId: givenId,
          type: GivenTypeEnum.String,
          isMultiple: true,
          values: ['a', 'b']
        }
      };

      let createResp = await sendToBackend({
        route: 'api/ToBackendCreateGiven',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createReq
      });

      assert.equal(createResp.result.type, 'Success');

      let req: ToBackendEditGivenRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          givenId: givenId,
          values: ['edited']
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendEditGiven',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
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

    assert.equal(resp.result.type, 'Success');

    let output: ToBackendEditGivenOutput = unwrapBackendResponseOutput({
      response: resp
    });

    assert.equal(output.givens.length, 1);

    assert.equal(output.givens[0].type, GivenTypeEnum.String);

    assert.equal(output.givens[0].isMultiple, true);

    assert.deepEqual(output.givens[0].values, ['edited']);

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
