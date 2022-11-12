import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'get-rebuild-struct__ok';

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

let envId = common.PROJECT_ENV_PROD;

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
            name: projectName,
            remoteType: common.ProjectRemoteTypeEnum.Managed,
            defaultBranch: common.BRANCH_MASTER
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
      }
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
        projectName: projectName,
        testProjectId: testProjectId,
        devRepoId: devRepoId,
        userAlias: userAlias,
        defaultBranch: common.BRANCH_MASTER,
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

    let getRebuildStructReq: apiToBackend.ToBackendGetRebuildStructRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendGetRebuildStruct,
        traceId: traceId,
        idempotencyKey: testId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: devRepoId,
        branch: common.BRANCH_MASTER,
        envId: envId
      }
    };

    resp =
      await helper.sendToBackend<apiToBlockml.ToBlockmlRebuildStructResponse>({
        httpServer: prep.httpServer,
        req: getRebuildStructReq
      });

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      pinoLogger: prep.pinoLogger
    });
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
