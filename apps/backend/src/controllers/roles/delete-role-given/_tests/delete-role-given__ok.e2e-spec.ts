import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToBackend } from '#backend/functions/top/send-to-backend/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';

import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendCreateGivenRequest } from '#common/types/backend/routes/givens/create-given/create-given-request';
import type { ToBackendCreateRoleRequest } from '#common/types/backend/routes/roles/create-role/create-role-request';
import type { ToBackendCreateRoleGivenRequest } from '#common/types/backend/routes/roles/create-role-given/create-role-given-request';
import type { ToBackendDeleteRoleGivenOutput } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-output';
import type { ToBackendDeleteRoleGivenRequest } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-request';
import type { ToBackendDeleteRoleGivenResponse } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-response';

let testId = 'backend-delete-role-given__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let roleId = 'role_one';
let givenId = 'GIVEN_ONE';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendDeleteRoleGivenResponse;

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
              remoteType: 'Managed',
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

      let createGivenReq: ToBackendCreateGivenRequest = {
        operation: 'createGiven',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          givenId: givenId,
          type: 'String',
          isMultiple: true,
          values: ['a', 'b', 'c']
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateGiven',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createGivenReq
      });

      let createRoleReq: ToBackendCreateRoleRequest = {
        operation: 'createRole',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: 'role_one'
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateRole',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleReq
      });

      let createRoleGivenReq: ToBackendCreateRoleGivenRequest = {
        operation: 'createRoleGiven',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: roleId,
          givenId: givenId,
          values: ['a']
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateRoleGiven',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleGivenReq
      });

      let req: ToBackendDeleteRoleGivenRequest = {
        operation: 'deleteRoleGiven',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: roleId,
          givenId: givenId
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendDeleteRoleGiven',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      await prep.app.close();
    } catch (e) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: prep?.logger,
        cs: prep?.cs
      });
      if (prep) {
        await prep.app.close();
      }
    }

    assert.equal(resp.type, 'Success');

    let output: ToBackendDeleteRoleGivenOutput = unwrapBackendResponseOutput({
      response: resp
    });

    assert.equal(output.roles.length, 1);

    assert.equal(output.roles[0].roleId, roleId);

    assert.deepEqual(output.roles[0].gvs, []);

    isPass = true;
  }, BACKEND_E2E_RETRY_OPTIONS).catch((er: any) => {
    logToConsoleBackend({
      log: er,
      logLevel: 'Error',
      logger: prep?.logger,
      cs: prep?.cs
    });
  });

  t.is(isPass, true);
});
