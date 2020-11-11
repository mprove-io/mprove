import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-2-to-disk-create-project';

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

  let isProjectExistRequest: api.ToDiskIsProjectExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let resp = <api.ToDiskIsProjectExistResponse>(
    await messageService.processRequest(isProjectExistRequest)
  );

  expect(resp.payload.isProjectExist).toBe(true);
});
