import { prepareTest } from '../../../functions/prepare-test';
import { api } from '../../../barrels/api';

let testId = 't-1-to-disk-create-organization';

let traceId = '123';
let organizationId = testId;

test(testId, async () => {
  let resp: api.ToDiskIsOrganizationExistResponse;

  try {
    let { messageService } = await prepareTest(organizationId);

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

    resp = await messageService.processRequest(isOrganizationExistRequest);

    // eslint-disable-next-line no-throw-literal
    // throw { a: { b: 123 } };
  } catch (e) {
    api.logToConsole(e);
  }

  expect(resp.payload.isOrganizationExist).toBe(true);
});
