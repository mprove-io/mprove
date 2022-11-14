import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-commit-repo__need-pull';

let traceId = testId;
let orgId = testId;
let projectId = common.makeId();
let projectName = 'p1';

test('1', async t => {
  let resp: apiToDisk.ToDiskCommitRepoResponse;

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

    let createDevRepoRequest: apiToDisk.ToDiskCreateDevRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        devRepoId: 'r2',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_saveFileRequest: apiToDisk.ToDiskSaveFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: common.BRANCH_MASTER,
        fileNodeId: `${projectId}/readme.md`,
        content: '1',
        userAlias: 'u1',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_commitRepoRequest: apiToDisk.ToDiskCommitRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: common.BRANCH_MASTER,
        userAlias: 'u1',
        commitMessage: 'r1-commitMessage',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_pushRepoRequest: apiToDisk.ToDiskPushRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPushRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: common.BRANCH_MASTER,
        userAlias: 'u1',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let r2_master_createFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r2',
        branch: common.BRANCH_MASTER,
        fileName: 's.view',
        parentNodeId: `${projectId}/`,
        userAlias: 'u2',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let r2_master_commitRepoRequest: apiToDisk.ToDiskCommitRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r2',
        branch: common.BRANCH_MASTER,
        userAlias: 'u2',
        commitMessage: 'r2-commitMessage',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);
    await messageService.processMessage(createDevRepoRequest);

    // await helper.delay(1000);

    await messageService.processMessage(r1_master_saveFileRequest);
    await messageService.processMessage(r1_master_commitRepoRequest);
    await messageService.processMessage(r1_master_pushRepoRequest);

    await messageService.processMessage(r2_master_createFileRequest);

    resp = await messageService.processMessage(r2_master_commitRepoRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: pLogger
    });
  }

  t.is(resp.payload.repo.repoStatus, common.RepoStatusEnum.NeedPull);
});
