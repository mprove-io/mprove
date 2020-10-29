import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';

let testId = 't-2-to-disk-is-project-exist';

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

  let isProjectExistRequest_1: api.ToDiskIsProjectExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId
    }
  };

  let isProjectExistRequest_2: api.ToDiskIsProjectExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsProjectExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: 'unknown_project'
    }
  };

  await messageService.processRequest(createOrganizationRequest);
  await messageService.processRequest(createProjectRequest);

  let isProjectExistResponse_1 = <api.ToDiskIsProjectExistResponse>(
    await messageService.processRequest(isProjectExistRequest_1)
  );

  let isProjectExistResponse_2 = <api.ToDiskIsProjectExistResponse>(
    await messageService.processRequest(isProjectExistRequest_2)
  );

  expect(isProjectExistResponse_1.payload.isProjectExist).toBe(true);
  expect(isProjectExistResponse_2.payload.isProjectExist).toBe(false);
});
