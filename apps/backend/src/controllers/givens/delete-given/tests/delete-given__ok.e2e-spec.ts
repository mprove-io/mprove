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
import { unwrapToBackendResponse } from '#common/functions/unwrap-to-backend-response/unwrap-to-backend-response';
import type { ToBackendCreateGivenRequest } from '#common/zod/backend/routes/givens/create-given/create-given-request';
import type { ToBackendDeleteGivenRequest } from '#common/zod/backend/routes/givens/delete-given/delete-given-request';
import type {
  ToBackendDeleteGivenOutput,
  ToBackendDeleteGivenResponse
} from '#common/zod/backend/routes/givens/delete-given/delete-given-response';
import type { ToBackendCreateRoleRequest } from '#common/zod/backend/routes/roles/create-role/create-role-request';
import type { ToBackendCreateRoleGivenRequest } from '#common/zod/backend/routes/roles/create-role-given/create-role-given-request';
import type { ToBackendGetRolesRequest } from '#common/zod/backend/routes/roles/get-roles/get-roles-request';
import type {
  ToBackendGetRolesOutput,
  ToBackendGetRolesResponse
} from '#common/zod/backend/routes/roles/get-roles/get-roles-response';

let testId = 'backend-delete-given__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let givenId = 'GIVEN_ONE';
let givenId2 = 'GIVEN_TWO';
let roleId = 'role_one';

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendDeleteGivenResponse;
    let getRolesResp: ToBackendGetRolesResponse;

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

      let createReq2: ToBackendCreateGivenRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          givenId: givenId2,
          type: GivenTypeEnum.String,
          isMultiple: true,
          values: ['c', 'd']
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateGiven',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createReq2
      });

      let createRoleReq: ToBackendCreateRoleRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: roleId
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

      let createRoleGivenReq2: ToBackendCreateRoleGivenRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: roleId,
          givenId: givenId2,
          values: ['c']
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateRoleGiven',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleGivenReq2
      });

      let req: ToBackendDeleteGivenRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          givenId: givenId
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendDeleteGiven',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      let getRolesReq: ToBackendGetRolesRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId
        }
      };

      getRolesResp = await sendToBackend({
        route: 'api/ToBackendGetRoles',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: getRolesReq
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

    let output: ToBackendDeleteGivenOutput = unwrapToBackendResponse({
      response: resp
    });

    assert.equal(output.givens.length, 1);

    assert.equal(output.givens[0].givenId, givenId2);

    assert.equal(getRolesResp.result.type, 'Success');

    let rolesOutput: ToBackendGetRolesOutput = unwrapToBackendResponse({
      response: getRolesResp
    });

    assert.equal(rolesOutput.roles.length, 1);

    assert.equal(rolesOutput.roles[0].roleId, roleId);

    assert.deepEqual(rolesOutput.roles[0].gvs, [
      {
        givenId: givenId2,
        values: ['c']
      }
    ]);

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
