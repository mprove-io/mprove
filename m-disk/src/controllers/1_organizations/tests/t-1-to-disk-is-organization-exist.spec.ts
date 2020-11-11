import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-1-to-disk-is-organization-exist';

let traceId = '123';
let organizationId = testId;

test(testId, async () => {
  let resp1: api.ToDiskIsOrganizationExistResponse;
  let resp2: api.ToDiskIsOrganizationExistResponse;

  try {
    let { messageService } = await helper.prepareTest(organizationId);

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

    resp1 = await messageService.processRequest(isOrganizationExistRequest_1);
    resp2 = await messageService.processRequest(isOrganizationExistRequest_2);
  } catch (e) {
    api.logToConsole(e);
  }
  expect(resp1.payload.isOrganizationExist).toBe(true);
  expect(resp2.payload.isOrganizationExist).toBe(false);
});
