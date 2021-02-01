import test from 'ava';
import { api } from '~backend/barrels/api';
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
  let resp: api.ToBlockmlRebuildStructResponse;

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

    await prep.rabbitService.sendToDisk<api.ToDiskSeedProjectResponse>({
      checkIsOk: true,
      routingKey: routingKey,
      message: <api.ToDiskSeedProjectRequest>{
        info: {
          name: api.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
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

    resp = await helper.sendToBackend<api.ToBlockmlRebuildStructResponse>({
      httpServer: prep.httpServer,
      req: <api.ToBackendRebuildStructSpecialRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendRebuildStructSpecial,
          traceId: traceId
        },
        payload: {
          organizationId: organizationId,
          projectId: projectId,
          repoId: devRepoId,
          branch: 'master',
          structId: testId,
          weekStart: api.ProjectWeekStartEnum.Monday,
          connections: [
            {
              name: 'c1',
              type: api.ConnectionTypeEnum.PostgreSQL
            }
          ]
        }
      }
    });

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.info.status, api.ResponseInfoStatusEnum.Ok);
});
