import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-3-to-disk-delete-dev-repo';

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

  let deleteDevRepoRequest: api.ToDiskDeleteDevRepoRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      devRepoId: 'r1'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let resp = <api.ToDiskDeleteDevRepoResponse>(
    await messageService.processRequest(deleteDevRepoRequest)
  );

  expect(resp.payload.deletedRepoId).toBe('r1');
});
