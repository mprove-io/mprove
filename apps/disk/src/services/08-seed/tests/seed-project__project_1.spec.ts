import test from 'ava';
import { api } from '~/barrels/api';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'seed-project__project_1';

let traceId = '123';
let organizationId = testId;
let projectId = 'project_1';

test('1', async t => {
  let resp: api.ToDiskSeedProjectResponse;

  try {
    let { messageService } = await prepareTest(organizationId);

    let seedProjectRequest: api.ToDiskSeedProjectRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        devRepoId: 'r1',
        userAlias: 'r1'
      }
    };

    resp = await messageService.processMessage(seedProjectRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, api.RepoStatusEnum.Ok);
  t.is(resp.payload.files[0].content, '# text');
});
