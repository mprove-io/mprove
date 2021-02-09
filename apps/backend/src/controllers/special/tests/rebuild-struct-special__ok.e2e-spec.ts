import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'rebuild-struct-special__ok';

let traceId = testId;
let organizationId = testId;
let projectId = testId;
let devRepoId = 'rbobert@example.com';
let userAlias = 'rbobert';

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBlockml.ToBlockmlRebuildStructResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        organizationIds: [organizationId]
      }
    });

    let routingKey = helper.makeRoutingKeyToDisk({
      organizationId: organizationId,
      projectId: null
    });

    await prep.rabbitService.sendToDisk<apiToDisk.ToDiskSeedProjectResponse>({
      checkIsOk: true,
      routingKey: routingKey,
      message: <apiToDisk.ToDiskSeedProjectRequest>{
        info: {
          name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
          traceId: traceId
        },
        payload: {
          organizationId: organizationId,
          projectId: projectId,
          devRepoId: devRepoId,
          userAlias: userAlias
        }
      }
    });

    resp = await helper.sendToBackend<apiToBlockml.ToBlockmlRebuildStructResponse>(
      {
        httpServer: prep.httpServer,
        req: <apiToBackend.ToBackendRebuildStructSpecialRequest>{
          info: {
            name:
              apiToBackend.ToBackendRequestInfoNameEnum
                .ToBackendRebuildStructSpecial,
            traceId: traceId
          },
          payload: {
            organizationId: organizationId,
            projectId: projectId,
            repoId: devRepoId,
            branch: 'master',
            structId: testId,
            weekStart: common.ProjectWeekStartEnum.Monday,
            connections: [
              {
                name: 'c1',
                type: common.ConnectionTypeEnum.PostgreSQL
              }
            ]
          }
        }
      }
    );

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
