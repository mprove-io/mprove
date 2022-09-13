import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'special-rebuild-struct__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123456';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = common.makeId();
let projectName = testId;

let devRepoId = userId;
let userAlias = testId;

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBlockml.ToBlockmlRebuildStructResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId],
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
            isEmailVerified: common.BoolEnum.TRUE
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
            name: projectName
          }
        ],
        members: [
          {
            memberId: userId,
            email,
            projectId,
            isAdmin: common.BoolEnum.TRUE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    // to disk

    let seedProjectReq: apiToDisk.ToDiskSeedProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        testProjectId: testProjectId,
        devRepoId: devRepoId,
        userAlias: userAlias,
        remoteType: common.ProjectRemoteTypeEnum.Managed,
        gitUrl: undefined,
        privateKey: undefined,
        publicKey: undefined
      }
    };

    await prep.rabbitService.sendToDisk<apiToDisk.ToDiskSeedProjectResponse>({
      checkIsOk: true,
      routingKey: helper.makeRoutingKeyToDisk({
        orgId: orgId,
        projectId: null
      }),
      message: seedProjectReq
    });

    // to backend

    let specialRebuildStructReq: apiToBackend.ToBackendSpecialRebuildStructRequest = {
      info: {
        name:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendSpecialRebuildStruct,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        isRepoProd: false,
        branch: 'master',
        structId: testId,
        connections: [
          {
            connectionId: 'c1',
            type: common.ConnectionTypeEnum.PostgreSQL
          }
        ]
      }
    };

    resp = await helper.sendToBackend<apiToBlockml.ToBlockmlRebuildStructResponse>(
      {
        httpServer: prep.httpServer,
        loginToken: prep.loginToken,
        req: specialRebuildStructReq
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
