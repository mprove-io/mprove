import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';
import { helper } from '../../../barrels/helper';

let testId = 't-3-to-disk-merge-repo-6';

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

  let createBranchRequest: api.ToDiskCreateBranchRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      fromBranch: 'master',
      newBranch: 'b2',
      isFromRemote: false
    }
  };

  let r1_master_saveFileRequest: api.ToDiskSaveFileRequest = {
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

  let r1_master_commitRepoRequest: api.ToDiskCommitRepoRequest = {
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

  let r1_b2_saveFileRequest: api.ToDiskSaveFileRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'b2',
      fileNodeId: `${projectId}/readme.md`,
      content: '2',
      userAlias: 'r1'
    }
  };

  let r1_b2_commitRepoRequest: api.ToDiskCommitRepoRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'b2',
      userAlias: 'r1',
      commitMessage: 'commitMessage-2'
    }
  };

  let r1_b2_mergeRepoRequest: api.ToDiskMergeRepoRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskMergeRepo,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'b2',
      userAlias: 'r1',
      theirBranch: 'master',
      isTheirBranchRemote: true
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  await helper.delay(1000);

  await messageService.processRequest(createBranchRequest);

  await messageService.processRequest(r1_master_saveFileRequest);
  await messageService.processRequest(r1_master_commitRepoRequest);
  await messageService.processRequest(r1_master_pushRepoRequest);

  await messageService.processRequest(r1_b2_saveFileRequest);
  await messageService.processRequest(r1_b2_commitRepoRequest);

  let resp = <api.ToDiskMergeRepoResponse>(
    await messageService.processRequest(r1_b2_mergeRepoRequest)
  );

  expect(resp.payload.repoStatus).toBe(api.RepoStatusEnum.NeedResolve);
});
