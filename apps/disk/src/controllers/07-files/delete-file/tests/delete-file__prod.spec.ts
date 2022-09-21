import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-delete-file__prod';

let traceId = testId;
let orgId = testId;
let projectId = common.makeId();

test('1', async t => {
  let resp: apiToDisk.ToDiskDeleteFileResponse;

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

    let deleteFileRequest: apiToDisk.ToDiskDeleteFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFile,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: common.PROD_REPO_ID,
        branch: common.BRANCH_MASTER,
        fileNodeId: `${projectId}/readme.md`,
        userAlias: 'u1',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    resp = await messageService.processMessage(deleteFileRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.repo.repoStatus, common.RepoStatusEnum.Ok);
});
