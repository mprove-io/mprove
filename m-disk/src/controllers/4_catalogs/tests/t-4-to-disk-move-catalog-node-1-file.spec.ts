import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-4-to-disk-move-catalog-node-1';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

test(testId, async () => {
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

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  await messageService.processRequest(createFolderRequest);

  let resp = <api.ToDiskMoveCatalogNodeResponse>(
    await messageService.processRequest(moveCatalogNodeRequest)
  );

  expect(resp.payload.nodes[0].children[0].children[0].id).toBe(
    'p1/fo1/readme.md'
  );
});
