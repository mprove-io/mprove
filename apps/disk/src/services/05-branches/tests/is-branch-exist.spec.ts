import test from 'ava';
import { api } from '~/barrels/api';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'is-branch-exist';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
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

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    resp1 = await messageService.processMessage(isBranchExistRequest_1);
    resp2 = await messageService.processMessage(isBranchExistRequest_2);
    resp3 = await messageService.processMessage(isBranchExistRequest_3);
    resp4 = await messageService.processMessage(isBranchExistRequest_4);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp1.payload.isBranchExist, true);
  t.is(resp2.payload.isBranchExist, true);
  t.is(resp3.payload.isBranchExist, false);
  t.is(resp4.payload.isBranchExist, false);
});
