import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-2-to-disk-is-project-exist';

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

  let isProjectExistRequest_1: api.ToDiskIsProjectExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId
    }
  };

  let isProjectExistRequest_2: api.ToDiskIsProjectExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: 'unknown_project'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let resp1 = <api.ToDiskIsProjectExistResponse>(
    await messageService.processRequest(isProjectExistRequest_1)
  );

  let resp2 = <api.ToDiskIsProjectExistResponse>(
    await messageService.processRequest(isProjectExistRequest_2)
  );

  expect(resp1.payload.isProjectExist).toBe(true);
  expect(resp2.payload.isProjectExist).toBe(false);
});
