import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-4-to-disk-rename-catalog-node-2';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test(testId, async () => {
  let resp: api.ToDiskRenameCatalogNodeResponse;

  try {
    let { messageService } = await helper.prepareTest(organizationId);

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

    await messageService.processRequest(createOrganizationRequest);
    await messageService.processRequest(createProjectRequest);

    await messageService.processRequest(createFolderRequest);

    resp = await messageService.processRequest(renameCatalogNodeRequest);
  } catch (e) {
    api.logToConsole(e);
  }

  expect(resp.payload.nodes[0].children[0].id).toBe('p1/fo2');
});
