import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';
import { interfaces } from '../../../barrels/interfaces';
import test from 'ava';
import { helper } from '../../../barrels/helper';

let testId = 'to-special-rebuild-struct__ok';

let traceId = '123';
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
      req: <api.ToSpecialRebuildStructRequest>{
        info: {
          name: api.ToSpecialRequestInfoNameEnum.ToSpecialRebuildStruct,
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
