import test from 'ava';
import { api } from '~disk/barrels/api';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'move-catalog-node__file';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskMoveCatalogNodeResponse;

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

    let createFolderRequest: api.ToDiskCreateFolderRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateFolder,
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

    let moveCatalogNodeRequest: api.ToDiskMoveCatalogNodeRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskMoveCatalogNode,
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
    api.logToConsole(e);
  }

  t.is(resp.payload.nodes[0].children[0].children[0].id, 'p1/fo1/readme.md');
});
