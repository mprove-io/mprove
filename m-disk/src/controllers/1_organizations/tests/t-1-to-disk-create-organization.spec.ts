import { Test, TestingModule } from '@nestjs/testing';
import { constants } from '../../../barrels/constants';
import { disk } from '../../../barrels/disk';
import { api } from '../../../barrels/api';
import { MessageService } from '../../../services/message.service';

let testId = 't-1-to-disk-create-organization';

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

  let isOrganizationExistRequest: api.ToDiskIsOrganizationExistRequest = {
    info: {
      name: api.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId
    }
  };

  await messageService.processRequest(createOrganizationRequest);

  let isOrganizationExistResponse = <api.ToDiskIsOrganizationExistResponse>(
    await messageService.processRequest(isOrganizationExistRequest)
  );

  expect(isOrganizationExistResponse.payload.isOrganizationExist).toBe(true);
});
