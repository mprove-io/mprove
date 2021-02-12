import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'pull-repo__force-need-push';

let traceId = '123';
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
        userAlias: 'r1'
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
        devRepoId: 'r2'
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
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`,
        content: '1',
        userAlias: 'r1'
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
        branch: 'master',
        userAlias: 'r1',
        commitMessage: 'r1-commitMessage-1'
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
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`,
        content: '2',
        userAlias: 'r1'
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
        branch: 'master',
        userAlias: 'r1',
        commitMessage: 'r1-commitMessage-2'
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
        branch: 'master',
        userAlias: 'r1'
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
        branch: 'master',
        fileName: 's.view',
        parentNodeId: `${projectId}/`,
        userAlias: 'r2'
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
        branch: 'master',
        userAlias: 'r2',
        commitMessage: 'r2-commitMessage-3'
      }
    };

    let r2_master_pullRepoRequest: apiToDisk.ToDiskPullRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskPullRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r2',
        branch: 'master',
        userAlias: 'r2'
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

    await messageService.processMessage(r2_master_createFileRequest);
    await messageService.processMessage(r2_master_commitRepoRequest);

    resp = await messageService.processMessage(r2_master_pullRepoRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, apiToDisk.RepoStatusEnum.NeedPush);
});
