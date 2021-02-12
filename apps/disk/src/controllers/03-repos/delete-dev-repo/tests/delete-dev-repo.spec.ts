import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'delete-dev-repo';

let traceId = '123';
let orgId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: apiToDisk.ToDiskDeleteDevRepoResponse;

  try {
    let { messageService } = await prepareTest(orgId);

    let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let createProjectRequest: apiToDisk.ToDiskCreateProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        devRepoId: 'r1',
        userAlias: 'r1'
      }
    };

    let deleteDevRepoRequest: apiToDisk.ToDiskDeleteDevRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        devRepoId: 'r1'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp = await messageService.processMessage(deleteDevRepoRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.deletedRepoId, 'r1');
});
