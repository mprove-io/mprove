import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';

let testId = 't-5-to-disk-is-branch-exist';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test(testId, async () => {
  let resp1: api.ToDiskIsBranchExistResponse;
  let resp2: api.ToDiskIsBranchExistResponse;
  let resp3: api.ToDiskIsBranchExistResponse;
  let resp4: api.ToDiskIsBranchExistResponse;

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

    let isBranchExistRequest_1: api.ToDiskIsBranchExistRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        isRemote: false
      }
    };

    let isBranchExistRequest_2: api.ToDiskIsBranchExistRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        isRemote: true
      }
    };

    let isBranchExistRequest_3: api.ToDiskIsBranchExistRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'unknown_branch',
        isRemote: false
      }
    };

    let isBranchExistRequest_4: api.ToDiskIsBranchExistRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'unknown_branch',
        isRemote: true
      }
    };

    await messageService.processRequest(createOrganizationRequest);
    await messageService.processRequest(createProjectRequest);

    resp1 = await messageService.processRequest(isBranchExistRequest_1);
    resp2 = await messageService.processRequest(isBranchExistRequest_2);
    resp3 = await messageService.processRequest(isBranchExistRequest_3);
    resp4 = await messageService.processRequest(isBranchExistRequest_4);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(resp1.payload.isBranchExist).toBe(true);
  expect(resp2.payload.isBranchExist).toBe(true);
  expect(resp3.payload.isBranchExist).toBe(false);
  expect(resp4.payload.isBranchExist).toBe(false);
});
