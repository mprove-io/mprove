import { api } from '~/barrels/api';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';

let testId = 'delete-dev-repo';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskDeleteDevRepoResponse;

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

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    resp = await messageService.processMessage(deleteDevRepoRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.deletedRepoId, 'r1');
});
