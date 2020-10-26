import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../barrels/constants';
import { disk } from '../../barrels/disk';
import { api } from '../../barrels/api';

import { MessageService } from '../../services/message.service';
import { helper } from '../../barrels/helper';

let testId = 't-3-1-3';

describe(`${testId} ${api.ToDiskRequestInfoNameEnum.ToDiskPullRepo}`, () => {
  let messageService: MessageService;
  let organizationId = testId;
  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectId = 'p1';
  let traceId = '123';
  let goalRepoStatus = api.RepoStatusEnum.NeedResolve;

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

  it(`should return repo status "${goalRepoStatus}"`, async () => {
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

    let r1_1_saveFileRequest: api.ToDiskSaveFileRequest = {
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

    let r1_1_commitRepoRequest1: api.ToDiskCommitRepoRequest = {
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
        commitMessage: 'r1-commitMessage-1'
      }
    };

    let r1_2_saveFileRequest: api.ToDiskSaveFileRequest = {
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
        content: '2'
      }
    };

    let r1_2_commitRepoRequest: api.ToDiskCommitRepoRequest = {
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
        commitMessage: 'r1-commitMessage-2'
      }
    };

    let r1_pushRepoRequest: api.ToDiskPushRepoRequest = {
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

    let r2_1_saveFileRequest: api.ToDiskSaveFileRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r2',
        branch: 'master',
        fileNodeId: `${projectId}/readme.md`,
        content: '3'
      }
    };

    let r2_1_commitRepoRequest: api.ToDiskCommitRepoRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId,
        projectId: projectId,
        repoId: 'r2',
        branch: 'master',
        userAlias: 'r2',
        commitMessage: 'r2-commitMessage-3'
      }
    };

    let r2_pullRepoRequest: api.ToDiskPullRepoRequest = {
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

    // let r2_pushRepoRequest: api.ToDiskPushRepoRequest = {
    //   info: {
    //     name: api.ToDiskRequestInfoNameEnum.ToDiskPushRepo,
    //     traceId: traceId
    //   },
    //   payload: {
    //     organizationId: organizationId,
    //     projectId: projectId,
    //     repoId: 'r2',
    //     branch: 'master',
    //     userAlias: 'r2'
    //   }
    // };

    await messageService.processRequest(createOrganizationRequest);
    await messageService.processRequest(createProjectRequest);
    await messageService.processRequest(createDevRepoRequest);

    await helper.delay(1000);

    await messageService.processRequest(r1_1_saveFileRequest);
    await messageService.processRequest(r1_1_commitRepoRequest1);
    await messageService.processRequest(r1_2_saveFileRequest);
    await messageService.processRequest(r1_2_commitRepoRequest);
    await messageService.processRequest(r1_pushRepoRequest);

    await messageService.processRequest(r2_1_saveFileRequest);
    await messageService.processRequest(r2_1_commitRepoRequest);

    let pullRepoResponse = <api.ToDiskPullRepoResponse>(
      await messageService.processRequest(r2_pullRepoRequest)
    );

    expect(pullRepoResponse.payload.repoStatus).toBe(goalRepoStatus);
  });
});
