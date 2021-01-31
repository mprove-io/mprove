import test from 'ava';
import { api } from '~/barrels/api';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'delete-project';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskIsProjectExistResponse;

  try {
    let { messageService } = await prepareTest(organizationId);

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

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);
    await messageService.processMessage(deleteProjectRequest);

    resp = await messageService.processMessage(isProjectExistRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.isProjectExist, false);
});