import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-3-to-disk-create-dev-repo';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test(testId, async () => {
  let { messageService } = await helper.prepareTest(organizationId);

  let createOrganizationRequest: api.ToDiskCreateOrganizationRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId
    }
  };

  let createProjectRequest: api.ToDiskCreateProjectRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateProject,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      devRepoId: 'r1',
      userAlias: 'r1'
    }
  };

  let createDevRepoRequest: api.ToDiskCreateDevRepoRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      devRepoId: 'r2'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let resp = <api.ToDiskCreateDevRepoResponse>(
    await messageService.processRequest(createDevRepoRequest)
  );

  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.Ok);
});
