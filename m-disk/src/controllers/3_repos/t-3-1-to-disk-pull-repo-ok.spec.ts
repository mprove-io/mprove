import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../barrels/constants';
import { disk } from '../../barrels/disk';
import { api } from '../../barrels/api';

import { MessageService } from '../../services/message.service';

let testId = 't-3-1';

describe(`${testId} ${api.ToDiskRequestInfoNameEnum.ToDiskPullRepo}`, () => {
  let messageService: MessageService;
  let organizationId = testId;
  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectId = 'p1';
  let traceId = '123';

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

  it(`should return repo status "${api.RepoStatusEnum.NeedPush}"`, async () => {
    let createOrganizationRequest: api.ToDiskCreateOrganizationRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId
      }
    };
    await messageService.processRequest(createOrganizationRequest);

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
    await messageService.processRequest(createProjectRequest);

    let createDevRepoRequest: api.ToDiskCreateDevRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        devRepoId: 'r2'
      }
    };
    await messageService.processRequest(createDevRepoRequest);

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
        content: '5'
      }
    };
    await messageService.processRequest(saveFileRequest);

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
        commitMessage: 'commitMessage'
      }
    };
    await messageService.processRequest(commitRepoRequest);

    let pushRepoRequest: api.ToDiskPushRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskPushRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r1',
        branch: 'master',
        userAlias: 'r1'
      }
    };
    await messageService.processRequest(pushRepoRequest);

    let pullRepoRequest: api.ToDiskPullRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskPullRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r2',
        branch: 'master',
        userAlias: 'r2'
      }
    };
    let pullRepoResponse = <api.ToDiskPullRepoResponse>(
      await messageService.processRequest(pullRepoRequest)
    );

    expect(pullRepoResponse.payload.repoStatus).toBe(
      api.RepoStatusEnum.NeedPush
    );
  });
});
