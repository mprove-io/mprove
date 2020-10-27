import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';

import { MessageService } from '../../../services/message.service';
import { helper } from '../../../barrels/helper';

let testId = 't-3-to-disk-revert-repo-to-last-commit-1';

describe(`${testId} ${api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit}`, () => {
  let messageService: MessageService;
  let organizationId = testId;
  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectId = 'p1';
  let traceId = '123';
  let goalRepoStatus = api.RepoStatusEnum.Ok;

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

  it(`repo status should be "${goalRepoStatus}"`, async () => {
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

    let saveFileRequest: api.ToDiskSaveFileRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`,
        content: '1'
      }
    };

    let revertRepoToLastCommitRequest: api.ToDiskRevertRepoToLastCommitRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master'
      }
    };

    await messageService.processRequest(createOrganizationRequest);
    await messageService.processRequest(createProjectRequest);

    await helper.delay(1000);

    await messageService.processRequest(saveFileRequest);

    let resp: api.ToDiskRevertRepoToLastCommitResponse = await messageService.processRequest(
      revertRepoToLastCommitRequest
    );

    expect(resp.payload.repoStatus).toBe(goalRepoStatus);
  });
});
