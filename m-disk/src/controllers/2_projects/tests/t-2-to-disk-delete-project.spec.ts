import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-2-to-disk-delete-project';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test(testId, async () => {
  let resp: api.ToDiskIsProjectExistResponse;

  try {
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

    let deleteProjectRequest: api.ToDiskDeleteProjectRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskDeleteProject,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId
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
    await messageService.processRequest(deleteProjectRequest);

    resp = await messageService.processRequest(isProjectExistRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(resp.payload.isProjectExist).toBe(false);
});
