import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { GivenTypeEnum } from '#common/enums/given-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendCreateGivenRequest } from '#common/zod/backend/routes/givens/create-given/create-given-request';
import type { ToBackendCreateRoleRequest } from '#common/zod/backend/routes/roles/create-role/create-role-request';
import type { ToBackendGetRolesOutput } from '#common/zod/backend/routes/roles/get-roles/get-roles-output';
import type { ToBackendGetRolesRequest } from '#common/zod/backend/routes/roles/get-roles/get-roles-request';
import type { ToBackendGetRolesResponse } from '#common/zod/backend/routes/roles/get-roles/get-roles-response';

let testId = 'backend-get-roles__ok';

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
    let resp: ToBackendGetRolesResponse;

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

      let createRoleBReq: ToBackendCreateRoleRequest = {
        operation: 'createRole',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: 'role_b'
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateRole',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleBReq
      });

      let createRoleAReq: ToBackendCreateRoleRequest = {
        operation: 'createRole',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: 'role_a'
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateRole',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleAReq
      });

      let createGivenBReq: ToBackendCreateGivenRequest = {
        operation: 'createGiven',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          givenId: 'GIVEN_B',
          type: GivenTypeEnum.String,
          isMultiple: true,
          values: ['b1', 'b2']
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateGiven',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createGivenBReq
      });

      let createGivenAReq: ToBackendCreateGivenRequest = {
        operation: 'createGiven',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          givenId: 'GIVEN_A',
          type: GivenTypeEnum.String,
          isMultiple: false,
          values: ['a']
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateGiven',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createGivenAReq
      });

      let req: ToBackendGetRolesRequest = {
        operation: 'getRoles',
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendGetRoles',
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

    assert.equal(resp.type, 'Success');

    let output: ToBackendGetRolesOutput = unwrapBackendResponseOutput({
      response: resp
    });

    assert.deepEqual(
      output.roles.map(x => x.roleId),
      ['role_a', 'role_b']
    );

    assert.deepEqual(
      output.givens.map(x => x.givenId),
      ['GIVEN_A', 'GIVEN_B']
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
