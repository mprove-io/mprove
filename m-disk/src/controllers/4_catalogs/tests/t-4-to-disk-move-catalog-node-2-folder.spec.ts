import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';

let testId = 't-4-to-disk-move-catalog-node-2';

let traceId = '123';
let organizationId = testId;
let projectId = 'p1';

let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

let messageService: MessageService;

beforeEach(async () => {
  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [MessageService]
  }).compile();

  messageService = moduleRef.get<MessageService>(MessageService);

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === true) {
    await disk.removePath(orgDir);
  }
});

test(testId, async () => {
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

  let createFolderRequest_1: api.ToDiskCreateFolderRequest = {
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

  let createFolderRequest_2: api.ToDiskCreateFolderRequest = {
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
      folderName: 'fo2'
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
      fromNodeId: 'p1/fo2',
      toNodeId: 'p1/fo1/fo2'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  await messageService.processRequest(createFolderRequest_1);
  await messageService.processRequest(createFolderRequest_2);

  let resp = <api.ToDiskMoveCatalogNodeResponse>(
    await messageService.processRequest(moveCatalogNodeRequest)
  );

  expect(resp.payload.nodes[0].children[0].children[0].id).toBe('p1/fo1/fo2');
});
