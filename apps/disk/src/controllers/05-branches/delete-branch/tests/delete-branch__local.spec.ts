import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-delete-branch__local';

let traceId = testId;
let orgId = testId;
let projectId = common.makeId();

test('1', async t => {
  let resp: apiToDisk.ToDiskDeleteBranchResponse;

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

    let createBranchRequest: apiToDisk.ToDiskCreateBranchRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        newBranch: 'b2',
        fromBranch: common.BRANCH_MASTER,
        isFromRemote: true,
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let deleteBranchRequest: apiToDisk.ToDiskDeleteBranchRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'b2',
        remoteType: common.ProjectRemoteTypeEnum.Managed,
        defaultBranch: common.BRANCH_MASTER
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createBranchRequest);

    resp = await messageService.processMessage(deleteBranchRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.deletedBranch, 'b2');
});
