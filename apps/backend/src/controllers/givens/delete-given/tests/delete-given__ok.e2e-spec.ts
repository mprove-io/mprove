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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type {
  ToBackendCreateGivenRequest,
  ToBackendCreateGivenResponse
} from '#common/zod/to-backend/givens/to-backend-create-given';
import type {
  ToBackendDeleteGivenRequest,
  ToBackendDeleteGivenResponse
} from '#common/zod/to-backend/givens/to-backend-delete-given';
import type {
  ToBackendCreateRoleRequest,
  ToBackendCreateRoleResponse
} from '#common/zod/to-backend/roles/to-backend-create-role';
import type {
  ToBackendCreateRoleGivenRequest,
  ToBackendCreateRoleGivenResponse
} from '#common/zod/to-backend/roles/to-backend-create-role-given';
import type {
  ToBackendGetRolesRequest,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';

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
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateGiven,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          givenId: givenId,
          type: GivenTypeEnum.String,
          isMultiple: true,
          values: ['a', 'b']
        }
      };

      let createResp = await sendToBackend<ToBackendCreateGivenResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createReq
      });

      assert.equal(createResp.info.error, undefined);
      assert.equal(createResp.info.status, ResponseInfoStatusEnum.Ok);

      let createReq2: ToBackendCreateGivenRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateGiven,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          givenId: givenId2,
          type: GivenTypeEnum.String,
          isMultiple: true,
          values: ['c', 'd']
        }
      };

      await sendToBackend<ToBackendCreateGivenResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createReq2
      });

      let createRoleReq: ToBackendCreateRoleRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateRole,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          roleId: roleId
        }
      };

      await sendToBackend<ToBackendCreateRoleResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleReq
      });

      let createRoleGivenReq: ToBackendCreateRoleGivenRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateRoleGiven,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          roleId: roleId,
          givenId: givenId,
          values: ['a']
        }
      };

      await sendToBackend<ToBackendCreateRoleGivenResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleGivenReq
      });

      let createRoleGivenReq2: ToBackendCreateRoleGivenRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateRoleGiven,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          roleId: roleId,
          givenId: givenId2,
          values: ['c']
        }
      };

      await sendToBackend<ToBackendCreateRoleGivenResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleGivenReq2
      });

      let req: ToBackendDeleteGivenRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendDeleteGiven,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          givenId: givenId
        }
      };

      resp = await sendToBackend<ToBackendDeleteGivenResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      let getRolesReq: ToBackendGetRolesRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGetRoles,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId
        }
      };

      getRolesResp = await sendToBackend<ToBackendGetRolesResponse>({
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

    assert.equal(resp.info.error, undefined);
    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);
    assert.equal(resp.payload.givens.length, 1);
    assert.equal(resp.payload.givens[0].givenId, givenId2);
    assert.equal(getRolesResp.info.error, undefined);
    assert.equal(getRolesResp.info.status, ResponseInfoStatusEnum.Ok);
    assert.equal(getRolesResp.payload.roles.length, 1);
    assert.equal(getRolesResp.payload.roles[0].roleId, roleId);
    assert.deepEqual(getRolesResp.payload.roles[0].gvs, [
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
