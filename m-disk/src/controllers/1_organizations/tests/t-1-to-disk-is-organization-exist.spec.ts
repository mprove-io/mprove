import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';

let testId = 't-1-to-disk-is-organization-exist';

let traceId = '123';
let organizationId = testId;
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

  let isOrganizationExistRequest_1: api.ToDiskIsOrganizationExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId
    }
  };

  let isOrganizationExistRequest_2: api.ToDiskIsOrganizationExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist,
      traceId: traceId
    },
    payload: {
      organizationId: 'unknown_org'
    }
  };

  await messageService.processRequest(createOrganizationRequest);

  let isOrganizationExistResponse_1 = <api.ToDiskIsOrganizationExistResponse>(
    await messageService.processRequest(isOrganizationExistRequest_1)
  );

  let isOrganizationExistResponse_2 = <api.ToDiskIsOrganizationExistResponse>(
    await messageService.processRequest(isOrganizationExistRequest_2)
  );

  expect(isOrganizationExistResponse_1.payload.isOrganizationExist).toBe(true);
  expect(isOrganizationExistResponse_2.payload.isOrganizationExist).toBe(false);
});
