import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-is-project-exist';

let traceId = testId;
let orgId = testId;
let projectId = common.makeId();
let projectName = 'p1';

test('1', async t => {
  let resp1: apiToDisk.ToDiskIsProjectExistResponse;
  let resp2: apiToDisk.ToDiskIsProjectExistResponse;

  let wLogger;

  try {
    let { messageService, logger } = await prepareTest(orgId);
    wLogger = logger;

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
        projectName: projectName,
        devRepoId: 'r1',
        userAlias: 'u1',
        remoteType: common.ProjectRemoteTypeEnum.Managed
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
    logToConsoleDisk({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: wLogger
    });
  }

  t.is(resp1.payload.isProjectExist, true);
  t.is(resp2.payload.isProjectExist, false);
});
