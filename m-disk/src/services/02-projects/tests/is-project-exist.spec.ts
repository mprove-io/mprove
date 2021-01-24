import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';
import test from 'ava';

let testId = 'is-project-exist';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp1: api.ToDiskIsProjectExistResponse;
  let resp2: api.ToDiskIsProjectExistResponse;

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

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    resp1 = await messageService.processMessage(isProjectExistRequest_1);
    resp2 = await messageService.processMessage(isProjectExistRequest_2);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp1.payload.isProjectExist, true);
  t.is(resp2.payload.isProjectExist, false);
});
