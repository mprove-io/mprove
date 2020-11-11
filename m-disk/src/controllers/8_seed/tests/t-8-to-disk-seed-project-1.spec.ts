import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-8-to-disk-seed-project-1';

let traceId = '123';
let organizationId = testId;
let projectId = 'project_1';

test(testId, async () => {
  let { messageService } = await helper.prepareTest(organizationId);

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

  let resp = <api.ToDiskSeedProjectResponse>(
    await messageService.processRequest(seedProjectRequest)
  );

  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.Ok);
  expect(resp.payload.files[0].content).toBe('# text');
});
