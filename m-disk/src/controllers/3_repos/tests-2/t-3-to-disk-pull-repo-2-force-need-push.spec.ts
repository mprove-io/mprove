import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';
import { helper } from '../../../barrels/helper';

let testId = 't-3-to-disk-pull-repo-2';

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

  let r1_master_saveFileRequest_1: api.ToDiskSaveFileRequest = {
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
      content: '1',
      userAlias: 'r1'
    }
  };

  let r1_master_commitRepoRequest_1: api.ToDiskCommitRepoRequest = {
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

  let r1_master_saveFileRequest_2: api.ToDiskSaveFileRequest = {
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
      content: '2',
      userAlias: 'r1'
    }
  };

  let r1_master_commitRepoRequest_2: api.ToDiskCommitRepoRequest = {
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

  let r1_master_pushRepoRequest: api.ToDiskPushRepoRequest = {
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

  let r2_master_createFileRequest: api.ToDiskCreateFileRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r2',
      branch: 'master',
      fileName: 's.view',
      parentNodeId: `${projectId}/`,
      userAlias: 'r2'
    }
  };

  let r2_master_commitRepoRequest: api.ToDiskCommitRepoRequest = {
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

  let r2_master_pullRepoRequest: api.ToDiskPullRepoRequest = {
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

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);
  await messageService.processRequest(createDevRepoRequest);

  await helper.delay(1000);

  await messageService.processRequest(r1_master_saveFileRequest_1);
  await messageService.processRequest(r1_master_commitRepoRequest_1);
  await messageService.processRequest(r1_master_saveFileRequest_2);
  await messageService.processRequest(r1_master_commitRepoRequest_2);
  await messageService.processRequest(r1_master_pushRepoRequest);

  await messageService.processRequest(r2_master_createFileRequest);
  await messageService.processRequest(r2_master_commitRepoRequest);

  let resp = <api.ToDiskPullRepoResponse>(
    await messageService.processRequest(r2_master_pullRepoRequest)
  );

  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.NeedPush);
});
