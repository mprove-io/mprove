import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';
import { helper } from '../../../barrels/helper';

let testId = 't-7-to-disk-create-file-2';

let messageService: MessageService;
let traceId = '123';
let organizationId = testId;
let projectId = 'p1';
let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

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

test(`${testId} ${api.ToDiskRequestInfoNameEnum.ToDiskCreateFile}`, async () => {
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

  let createFileRequest: api.ToDiskCreateFileRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: constants.PROD_REPO_ID,
      branch: 'master',
      parentNodeId: `${projectId}/`,
      fileName: 's.view',
      userAlias: 'r1'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  await helper.delay(1000);

  let createFileResponse = <api.ToDiskCreateFileResponse>(
    await messageService.processRequest(createFileRequest)
  );

  expect(createFileResponse.payload.repoStatus).toBe(api.RepoStatusEnum.Ok);
});
