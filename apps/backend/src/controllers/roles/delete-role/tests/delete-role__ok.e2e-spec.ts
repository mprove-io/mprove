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
import { makeId } from '#common/functions/make-id/make-id';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { Member } from '#common/zod/backend/member';
import type { ToBackendGetMembersRequest } from '#common/zod/backend/routes/members/get-members/get-members-request';
import type { ToBackendGetMembersOutput } from '#common/zod/backend/routes/members/get-members/get-members-response';
import type { ToBackendCreateRoleRequest } from '#common/zod/backend/routes/roles/create-role/create-role-request';
import type { ToBackendDeleteRoleRequest } from '#common/zod/backend/routes/roles/delete-role/delete-role-request';
import type {
  ToBackendDeleteRoleOutput,
  ToBackendDeleteRoleResponse
} from '#common/zod/backend/routes/roles/delete-role/delete-role-response';

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
        req: createRoleOneReq
      });

      let createRoleTwoReq: ToBackendCreateRoleRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: 'role_two'
        }
      };

      await sendToBackend({
        route: 'api/ToBackendCreateRole',
        checkIsOk: true,
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: createRoleTwoReq
      });

      let req: ToBackendDeleteRoleRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          roleId: 'role_one'
        }
      };

      resp = await sendToBackend({
        route: 'api/ToBackendDeleteRole',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: req
      });

      let getMembersReq: ToBackendGetMembersRequest = {
        traceId: traceId,
        idempotencyKey: makeId(),
        input: {
          projectId: projectId,
          pageNum: 1,
          perPage: 10
        }
      };

      let getMembersResp = await sendToBackend({
        route: 'api/ToBackendGetMembers',
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: getMembersReq
      });

      assert.equal(getMembersResp.result.type, 'Success');

      let getMembersOutput: ToBackendGetMembersOutput =
        unwrapBackendResponseOutput({
          response: getMembersResp
        });

      let adminMember: Member = getMembersOutput.members.find(
        member => member.memberId === userId
      );

      let projectMember: Member = getMembersOutput.members.find(
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

    assert.equal(resp.result.type, 'Success');

    let output: ToBackendDeleteRoleOutput = unwrapBackendResponseOutput({
      response: resp
    });

    assert.deepEqual(output.userMember.roles, ['role_two']);

    assert.deepEqual(
      output.roles.map(x => x.roleId),
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
