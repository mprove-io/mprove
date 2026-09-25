import assert from 'node:assert/strict';
import retry from 'async-retry';
import test from 'ava';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { prepareTestAndSeed } from '#backend/functions/prepare-test';
import { sendToBackend } from '#backend/functions/send-to-backend';
import type { Prep } from '#backend/interfaces/prep';
import { BRANCH_MAIN } from '#common/constants/top';
import { BACKEND_E2E_RETRY_OPTIONS } from '#common/constants/top-backend';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id/make-id';
import type {
  ToBackendGetMembersRequest,
  ToBackendGetMembersResponse
} from '#common/zod/to-backend/members/to-backend-get-members';
import type {
  ToBackendCreateRoleRequest,
  ToBackendCreateRoleResponse
} from '#common/zod/to-backend/roles/to-backend-create-role';
import type {
  ToBackendDeleteRoleRequest,
  ToBackendDeleteRoleResponse
} from '#common/zod/to-backend/roles/to-backend-delete-role';

let testId = 'backend-delete-role__ok';

let traceId = testId;

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let memberUserId = makeId();
let memberUserEmail = `2nd-${testId}@example.com`;

test('1', async t => {
  let isPass: boolean;
  let prep: Prep;

  await retry(async (bail: any) => {
    let resp: ToBackendDeleteRoleResponse;

    try {
      prep = await prepareTestAndSeed({
        traceId: traceId,
        deleteRecordsPayload: {
          emails: [email, memberUserEmail],
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
            },
            {
              userId: memberUserId,
              email: memberUserEmail,
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
              isExplorer: true,
              roles: ['role_one', 'role_two']
            },
            {
              memberId: memberUserId,
              email: memberUserEmail,
              projectId: projectId,
              isAdmin: false,
              isEditor: true,
              isExplorer: true,
              roles: ['role_one']
            }
          ]
        },
        loginUserPayload: { email: email, password: password }
      });

      let createRoleOneReq: ToBackendCreateRoleRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateRole,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          roleId: 'role_one'
        }
      };

      await sendToBackend<ToBackendCreateRoleResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleOneReq
      });

      let createRoleTwoReq: ToBackendCreateRoleRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendCreateRole,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          roleId: 'role_two'
        }
      };

      await sendToBackend<ToBackendCreateRoleResponse>({
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleTwoReq
      });

      let req: ToBackendDeleteRoleRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendDeleteRole,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          roleId: 'role_one'
        }
      };

      resp = await sendToBackend<ToBackendDeleteRoleResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      let getMembersReq: ToBackendGetMembersRequest = {
        info: {
          name: ToBackendRequestInfoNameEnum.ToBackendGetMembers,
          traceId: traceId,
          idempotencyKey: makeId()
        },
        payload: {
          projectId: projectId,
          pageNum: 1,
          perPage: 10
        }
      };

      let getMembersResp = await sendToBackend<ToBackendGetMembersResponse>({
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: getMembersReq
      });

      assert.equal(getMembersResp.info.error, undefined);

      let adminMember = getMembersResp.payload.members.find(
        member => member.memberId === userId
      );
      let projectMember = getMembersResp.payload.members.find(
        member => member.memberId === memberUserId
      );

      assert.ok(adminMember);
      assert.ok(projectMember);
      assert.deepEqual(adminMember.roles, ['role_two']);
      assert.deepEqual(projectMember.roles, []);

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
    assert.deepEqual(resp.payload.userMember.roles, ['role_two']);
    assert.deepEqual(
      resp.payload.roles.map(x => x.roleId),
      ['role_two']
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
