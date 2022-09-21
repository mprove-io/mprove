import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-move-catalog-node__file';

let traceId = testId;
let orgId = testId;
let projectId = common.makeId();

test('1', async t => {
  let resp: apiToDisk.ToDiskMoveCatalogNodeResponse;

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

    let createFolderRequest: apiToDisk.ToDiskCreateFolderRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: common.BRANCH_MASTER,
        parentNodeId: `${projectId}/`,
        folderName: 'fo1',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    let moveCatalogNodeRequest: apiToDisk.ToDiskMoveCatalogNodeRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode,
        traceId: traceId
      },
      payload: {
        orgId: orgId,
        projectId: projectId,
        repoId: 'r1',
        branch: common.BRANCH_MASTER,
        fromNodeId: 'p1/readme.md',
        toNodeId: 'p1/fo1/readme.md',
        remoteType: common.ProjectRemoteTypeEnum.Managed
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createFolderRequest);

    resp = await messageService.processMessage(moveCatalogNodeRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(
    resp.payload.repo.nodes[0].children[0].children[0].id,
    'p1/fo1/readme.md'
  );
});
