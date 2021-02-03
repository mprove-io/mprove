import test from 'ava';
import { api } from '~disk/barrels/api';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'delete-branch__remote';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskDeleteBranchResponse;

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
        newBranch: 'b2',
        fromBranch: 'master',
        isFromRemote: true
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
        branch: 'b2',
        userAlias: 'r1'
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
        repoId: api.PROD_REPO_ID,
        branch: 'b2'
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createBranchRequest);
    await messageService.processMessage(pushRepoRequest);

    resp = await messageService.processMessage(deleteBranchRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.deletedBranch, 'b2');
});
