import { api } from '../../../barrels/api';
import { helper } from '../../../barrels/helper';

let testId = 't-1-to-disk-delete-organization';

let traceId = '123';
let organizationId = testId;

test(testId, async () => {
  let resp: api.ToDiskIsOrganizationExistResponse;

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

    let deleteOrganizationRequest: api.ToDiskDeleteOrganizationRequest = {
      info: {
        name: api.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization,
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
    await messageService.processRequest(deleteOrganizationRequest);

    resp = await messageService.processRequest(isOrganizationExistRequest);
  } catch (e) {
    api.logToConsole(e);
  }
  expect(resp.payload.isOrganizationExist).toBe(false);
});
