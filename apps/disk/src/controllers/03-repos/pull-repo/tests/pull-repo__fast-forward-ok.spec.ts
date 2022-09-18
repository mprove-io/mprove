import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-pull-repo__fast-forward-ok';

let traceId = testId;
let orgId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: apiToDisk.ToDiskPullRepoResponse;

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

    let r1_master_saveFileRequest_1: apiToDisk.ToDiskSaveFileRequest = {
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

    let r1_master_commitRepoRequest_1: apiToDisk.ToDiskCommitRepoRequest = {
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
        commitMessage: 'r1-commitMessage-1',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_saveFileRequest_2: apiToDisk.ToDiskSaveFileRequest = {
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
        content: '2',
        userAlias: 'u1',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let r1_master_commitRepoRequest_2: apiToDisk.ToDiskCommitRepoRequest = {
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
        commitMessage: 'r1-commitMessage-2',
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

    let r2_pullRepoRequest: apiToDisk.ToDiskPullRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPullRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r2',
        branch: common.BRANCH_MASTER,
        userAlias: 'u2',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);
    await messageService.processMessage(createDevRepoRequest);

    // await helper.delay(1000);

    await messageService.processMessage(r1_master_saveFileRequest_1);
    await messageService.processMessage(r1_master_commitRepoRequest_1);
    await messageService.processMessage(r1_master_saveFileRequest_2);
    await messageService.processMessage(r1_master_commitRepoRequest_2);
    await messageService.processMessage(r1_master_pushRepoRequest);

    resp = await messageService.processMessage(r2_pullRepoRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.repo.repoStatus, common.RepoStatusEnum.Ok);
});
