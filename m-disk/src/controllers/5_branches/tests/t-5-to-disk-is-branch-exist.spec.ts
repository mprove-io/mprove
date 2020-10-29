import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';

let testId = 't-5-to-disk-is-branch-exist';

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

  let isBranchExistRequest_1: api.ToDiskIsBranchExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'master',
      isRemote: false
    }
  };

  let isBranchExistRequest_2: api.ToDiskIsBranchExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'master',
      isRemote: true
    }
  };

  let isBranchExistRequest_3: api.ToDiskIsBranchExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'unknown_branch',
      isRemote: false
    }
  };

  let isBranchExistRequest_4: api.ToDiskIsBranchExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsBranchExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: 'r1',
      branch: 'unknown_branch',
      isRemote: true
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let resp1 = <api.ToDiskIsBranchExistResponse>(
    await messageService.processRequest(isBranchExistRequest_1)
  );

  let resp2 = <api.ToDiskIsBranchExistResponse>(
    await messageService.processRequest(isBranchExistRequest_2)
  );

  let resp3 = <api.ToDiskIsBranchExistResponse>(
    await messageService.processRequest(isBranchExistRequest_3)
  );

  let resp4 = <api.ToDiskIsBranchExistResponse>(
    await messageService.processRequest(isBranchExistRequest_4)
  );

  expect(resp1.payload.isBranchExist).toBe(true);
  expect(resp2.payload.isBranchExist).toBe(true);
  expect(resp3.payload.isBranchExist).toBe(false);
  expect(resp4.payload.isBranchExist).toBe(false);
});
