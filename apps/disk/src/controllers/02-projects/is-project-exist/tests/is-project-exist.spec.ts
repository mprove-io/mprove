import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'is-project-exist';

let traceId = '123';
let orgId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp1: apiToDisk.ToDiskIsProjectExistResponse;
  let resp2: apiToDisk.ToDiskIsProjectExistResponse;

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

    let isProjectExistRequest_1: apiToDisk.ToDiskIsProjectExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId
      }
    };

    let isProjectExistRequest_2: apiToDisk.ToDiskIsProjectExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: 'unknown_project'
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp1 = await messageService.processMessage(isProjectExistRequest_1);
    resp2 = await messageService.processMessage(isProjectExistRequest_2);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp1.payload.isProjectExist, true);
  t.is(resp2.payload.isProjectExist, false);
});
