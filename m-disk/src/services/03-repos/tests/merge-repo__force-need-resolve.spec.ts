import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { prepareTest } from '~/functions/prepare-test';
import test from 'ava';

let testId = 'merge-repo__force-need-resolve';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskMergeRepoResponse;

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

    let createBranchRequest: api.ToDiskCreateBranchRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        fromBranch: 'master',
        newBranch: 'b2',
        isFromRemote: false
      }
    };

    let r1_master_saveFileRequest: api.ToDiskSaveFileRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`,
        content: '1',
        userAlias: 'r1'
      }
    };

    let r1_master_commitRepoRequest: api.ToDiskCommitRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        userAlias: 'r1',
        commitMessage: 'commitMessage-1'
      }
    };

    let r1_b2_saveFileRequest: api.ToDiskSaveFileRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        fileNodeId: `${projectId}/readme.md`,
        content: '2',
        userAlias: 'r1'
      }
    };

    let r1_b2_commitRepoRequest: api.ToDiskCommitRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        userAlias: 'r1',
        commitMessage: 'commitMessage-2'
      }
    };

    let r1_b2_mergeRepoRequest: api.ToDiskMergeRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskMergeRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        userAlias: 'r1',
        theirBranch: 'master',
        isTheirBranchRemote: false
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    // await helper.delay(1000);

    await messageService.processMessage(createBranchRequest);

    await messageService.processMessage(r1_master_saveFileRequest);
    await messageService.processMessage(r1_master_commitRepoRequest);

    await messageService.processMessage(r1_b2_saveFileRequest);
    await messageService.processMessage(r1_b2_commitRepoRequest);

    resp = await messageService.processMessage(r1_b2_mergeRepoRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.repoStatus, api.RepoStatusEnum.NeedResolve);
});
