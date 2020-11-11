import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-5-to-disk-delete-branch-1';

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
      newBranch: 'b2',
      fromBranch: 'master',
      isFromRemote: true
    }
  };

  let deleteBranchRequest: api.ToDiskDeleteBranchRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'b2'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  await messageService.processRequest(createBranchRequest);

  let resp = <api.ToDiskDeleteBranchResponse>(
    await messageService.processRequest(deleteBranchRequest)
  );

  expect(resp.payload.deletedBranch).toBe('b2');
});
