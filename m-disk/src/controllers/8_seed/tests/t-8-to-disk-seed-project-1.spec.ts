import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';

let testId = 't-8-to-disk-seed-project-1';

let traceId = '123';
let organizationId = testId;
let projectId = 'project_1';

test(testId, async () => {
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

    resp = await messageService.processRequest(seedProjectRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.Ok);
  expect(resp.payload.files[0].content).toBe('# text');
});
