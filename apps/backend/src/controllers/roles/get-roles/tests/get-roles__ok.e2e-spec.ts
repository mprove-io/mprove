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
  ToBackendCreateRoleRequest,
  ToBackendCreateRoleResponse
} from '#common/zod/to-backend/roles/to-backend-create-role';
import type {
  ToBackendGetRolesRequest,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';

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
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateRole,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          roleId: 'role_b'
        }
      };

      await sendToBackend<ToBackendCreateRoleResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleBReq
      });

      let createRoleAReq: ToBackendCreateRoleRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateRole,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          roleId: 'role_a'
        }
      };

      await sendToBackend<ToBackendCreateRoleResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleAReq
      });

      let createGivenBReq: ToBackendCreateGivenRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateGiven,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          givenId: 'GIVEN_B',
          type: GivenTypeEnum.String,
          isMultiple: true,
          values: ['b1', 'b2']
        }
      };

      await sendToBackend<ToBackendCreateGivenResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createGivenBReq
      });

      let createGivenAReq: ToBackendCreateGivenRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateGiven,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          givenId: 'GIVEN_A',
          type: GivenTypeEnum.String,
          isMultiple: false,
          values: ['a']
        }
      };

      await sendToBackend<ToBackendCreateGivenResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createGivenAReq
      });

      let req: ToBackendGetRolesRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGetRoles,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId
        }
      };

      resp = await sendToBackend<ToBackendGetRolesResponse>({
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

    assert.equal(resp.info.error, undefined);
    assert.equal(resp.info.status, ResponseInfoStatusEnum.Ok);
    assert.deepEqual(
      resp.payload.roles.map(x => x.roleId),
      ['role_a', 'role_b']
    );
    assert.deepEqual(
      resp.payload.givens.map(x => x.givenId),
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
