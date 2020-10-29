import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';
import { helper } from '../../../barrels/helper';

let testId = 't-6-to-disk-delete-folder';

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

  let deleteFolderRequest: api.ToDiskDeleteFolderRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskDeleteFolder,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'master',
      folderNodeId: `${projectId}/fo1`
    }
  };

  let commitRepoRequest: api.ToDiskCommitRepoRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'master',
      userAlias: 'r1',
      commitMessage: 'commitMessage-1'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  await messageService.processRequest(createFolderRequest);
  await messageService.processRequest(commitRepoRequest);

  let resp = <api.ToDiskDeleteFolderResponse>(
    await messageService.processRequest(deleteFolderRequest)
  );

  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.NeedCommit);
});
