import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-5-to-disk-create-branch-2';

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

  let saveFileRequest: api.ToDiskSaveFileRequest = {
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

  let commitRepoRequest: api.ToDiskCommitRepoRequest = {
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
      commitMessage: 'r1-commitMessage-1'
    }
  };

  let pushRepoRequest: api.ToDiskPushRepoRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskPushRepo,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'master',
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
      newBranch: 'b2',
      fromBranch: 'master',
      isFromRemote: false
    }
  };

  let isBranchExistRequest: api.ToDiskIsBranchExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'b2',
      isRemote: false
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  await helper.delay(1000);

  await messageService.processRequest(saveFileRequest);
  await messageService.processRequest(commitRepoRequest);
  await messageService.processRequest(pushRepoRequest);

  await messageService.processRequest(createBranchRequest);

  let resp = <api.ToDiskIsBranchExistResponse>(
    await messageService.processRequest(isBranchExistRequest)
  );

  expect(resp.payload.isBranchExist).toBe(true);
});
