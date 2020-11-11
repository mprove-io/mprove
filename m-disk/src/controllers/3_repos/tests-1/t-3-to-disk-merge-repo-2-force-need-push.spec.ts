import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-3-to-disk-merge-repo-2';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test(testId, async () => {
  let { messageService } = await helper.prepareTest(organizationId);

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

  let r1_master_commitRepoRequest1: api.ToDiskCommitRepoRequest = {
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

  let r1_b2_createFileRequest: api.ToDiskCreateFileRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'b2',
      fileName: 's.view',
      parentNodeId: `${projectId}/`,
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

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  await helper.delay(1000);

  await messageService.processRequest(createBranchRequest);

  await messageService.processRequest(r1_master_saveFileRequest);
  await messageService.processRequest(r1_master_commitRepoRequest1);

  await messageService.processRequest(r1_b2_createFileRequest);
  await messageService.processRequest(r1_b2_commitRepoRequest);

  let resp = <api.ToDiskMergeRepoResponse>(
    await messageService.processRequest(r1_b2_mergeRepoRequest)
  );

  // NeedPush because we merge with different branch
  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.NeedPush);
});
