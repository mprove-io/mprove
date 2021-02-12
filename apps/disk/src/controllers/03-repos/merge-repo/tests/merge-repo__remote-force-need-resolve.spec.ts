import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'merge-repo__remote-force-need-resolve';

let traceId = '123';
let orgId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: apiToDisk.ToDiskMergeRepoResponse;

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

    let createBranchRequest: apiToDisk.ToDiskCreateBranchRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        fromBranch: 'master',
        newBranch: 'b2',
        isFromRemote: false
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
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`,
        content: '1',
        userAlias: 'r1'
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
        branch: 'master',
        userAlias: 'r1',
        commitMessage: 'commitMessage-1'
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

    let r1_b2_saveFileRequest: apiToDisk.ToDiskSaveFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        fileNodeId: `${projectId}/readme.md`,
        content: '2',
        userAlias: 'r1'
      }
    };

    let r1_b2_commitRepoRequest: apiToDisk.ToDiskCommitRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        userAlias: 'r1',
        commitMessage: 'commitMessage-2'
      }
    };

    let r1_b2_mergeRepoRequest: apiToDisk.ToDiskMergeRepoRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMergeRepo,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        userAlias: 'r1',
        theirBranch: 'master',
        isTheirBranchRemote: true
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    // await helper.delay(1000);

    await messageService.processMessage(createBranchRequest);

    await messageService.processMessage(r1_master_saveFileRequest);
    await messageService.processMessage(r1_master_commitRepoRequest);
    await messageService.processMessage(r1_master_pushRepoRequest);

    await messageService.processMessage(r1_b2_saveFileRequest);
    await messageService.processMessage(r1_b2_commitRepoRequest);

    resp = await messageService.processMessage(r1_b2_mergeRepoRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, apiToDisk.RepoStatusEnum.NeedResolve);
});
