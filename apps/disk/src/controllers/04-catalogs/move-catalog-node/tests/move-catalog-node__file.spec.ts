import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'move-catalog-node__file';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: apiToDisk.ToDiskMoveCatalogNodeResponse;

  try {
    let { messageService } = await prepareTest(organizationId);

    let createOrganizationRequest: apiToDisk.ToDiskCreateOrganizationRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId
      }
    };

    let createProjectRequest: apiToDisk.ToDiskCreateProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateProject,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        devRepoId: 'r1',
        userAlias: 'r1'
      }
    };

    let createFolderRequest: apiToDisk.ToDiskCreateFolderRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        parentNodeId: `${projectId}/`,
        folderName: 'fo1'
      }
    };

    let moveCatalogNodeRequest: apiToDisk.ToDiskMoveCatalogNodeRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        fromNodeId: 'p1/readme.md',
        toNodeId: 'p1/fo1/readme.md'
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createFolderRequest);

    resp = await messageService.processMessage(moveCatalogNodeRequest);
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.payload.nodes[0].children[0].children[0].id, 'p1/fo1/readme.md');
});