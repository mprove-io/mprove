import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-delete-dev-repo';

let traceId = testId;
let orgId = testId;
let projectId = common.makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: apiToDisk.ToDiskDeleteDevRepoResponse;

  let pLogger;

  try {
    let { messageService, logger: logger } = await prepareTest(orgId);
    pLogger = logger;

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
    logToConsoleDisk({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: pLogger
    });
  }

  t.is(resp.payload.deletedRepoId, 'r1');
});
