import test from 'ava';
import { api } from '~/barrels/api';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'rename-catalog-node__folder';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test('1', async t => {
  let resp: api.ToDiskRenameCatalogNodeResponse;

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

    let renameCatalogNodeRequest: api.ToDiskRenameCatalogNodeRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskRenameCatalogNode,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        nodeId: 'p1/fo1',
        newName: 'fo2'
      }
    };

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(createProjectRequest);

    await messageService.processMessage(createFolderRequest);

    resp = await messageService.processMessage(renameCatalogNodeRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp.payload.nodes[0].children[0].id, 'p1/fo2');
});
