import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';
import { helper } from '../../../barrels/helper';

let testId = 't-7-to-disk-delete-file-2';

describe(`${testId} ${api.ToDiskRequestInfoNameEnum.ToDiskDeleteFile}`, () => {
  let messageService: MessageService;
  let traceId = '123';
  let organizationId = testId;
  let projectId = 'p1';
  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [MessageService]
    }).compile();

    messageService = app.get<MessageService>(MessageService);

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === true) {
      await disk.removePath(orgDir);
    }
  });

  it('should pass', async () => {
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

    let deleteFileRequest: api.ToDiskDeleteFileRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskDeleteFile,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: constants.PROD_REPO_ID,
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`,
        userAlias: 'r1'
      }
    };

    await messageService.processRequest(createOrganizationRequest);
    await messageService.processRequest(createProjectRequest);

    await helper.delay(1000);

    let createFileResponse = <api.ToDiskCreateFileResponse>(
      await messageService.processRequest(deleteFileRequest)
    );

    expect(createFileResponse.payload.repoStatus).toBe(api.RepoStatusEnum.Ok);
  });
});
