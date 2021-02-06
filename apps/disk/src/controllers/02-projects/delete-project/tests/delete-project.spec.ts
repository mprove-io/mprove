import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'delete-project';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: apiToDisk.ToDiskIsProjectExistResponse;

  try {
    let { messageService } = await prepareTest(organizationId);

    let createOrganizationRequest: apiToDisk.ToDiskCreateOrganizationRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId
      }
    };

    let createProjectRequest: apiToDisk.ToDiskCreateProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        devRepoId: 'r1',
        userAlias: 'r1'
      }
    };

    let deleteProjectRequest: apiToDisk.ToDiskDeleteProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteProject,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId
      }
    };

    let isProjectExistRequest: apiToDisk.ToDiskIsProjectExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
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
    common.logToConsole(e);
  }

  t.is(resp.payload.isProjectExist, false);
});
