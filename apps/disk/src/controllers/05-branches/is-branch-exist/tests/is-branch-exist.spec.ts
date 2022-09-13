import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-is-branch-exist';

let traceId = testId;
let orgId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp1: apiToDisk.ToDiskIsBranchExistResponse;
  let resp2: apiToDisk.ToDiskIsBranchExistResponse;
  let resp3: apiToDisk.ToDiskIsBranchExistResponse;
  let resp4: apiToDisk.ToDiskIsBranchExistResponse;

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

    let isBranchExistRequest_1: apiToDisk.ToDiskIsBranchExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        isRemote: false,
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let isBranchExistRequest_2: apiToDisk.ToDiskIsBranchExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        isRemote: true,
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let isBranchExistRequest_3: apiToDisk.ToDiskIsBranchExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'unknown_branch',
        isRemote: false,
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let isBranchExistRequest_4: apiToDisk.ToDiskIsBranchExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'unknown_branch',
        isRemote: true,
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp1 = await messageService.processMessage(isBranchExistRequest_1);
    resp2 = await messageService.processMessage(isBranchExistRequest_2);
    resp3 = await messageService.processMessage(isBranchExistRequest_3);
    resp4 = await messageService.processMessage(isBranchExistRequest_4);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp1.payload.isBranchExist, true);
  t.is(resp2.payload.isBranchExist, true);
  t.is(resp3.payload.isBranchExist, false);
  t.is(resp4.payload.isBranchExist, false);
});
