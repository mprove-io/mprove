import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';
import { interfaces } from '../../../barrels/interfaces';
import * as request from 'supertest';
import test from 'ava';

let testId = 'to-special-rebuild-struct__ok';

let traceId = '123';
let organizationId = testId;
let projectId = testId;
let devRepoId = 'rbobert@example.com';
let userAlias = 'rbobert';

let prep: interfaces.Prep;

test('1', async t => {
  let response: request.Response;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        organizationIds: [organizationId]
      }
    });

    // toDisk

    let toDiskSeedProjectRequest: api.ToDiskSeedProjectRequest = {
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
    };

    await request(prep.httpServer)
      .post('/' + toDiskSeedProjectRequest.info.name)
      .send(toDiskSeedProjectRequest);

    // toSpecial

    let toSpecialRebuildStructRequest: api.ToSpecialRebuildStructRequest = {
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
    };

    response = await request(prep.httpServer)
      .post('/' + toSpecialRebuildStructRequest.info.name)
      .send(toSpecialRebuildStructRequest);

    await prep.app.close();
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(
    (response.body as api.ToBlockmlRebuildStructResponse).info.status,
    api.ResponseInfoStatusEnum.Ok
  );
});
