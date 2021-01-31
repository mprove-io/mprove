import test from 'ava';
import { api } from '~disk/barrels/api';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'is-organization-exist';

let traceId = '123';
let organizationId = testId;

test('1', async t => {
  let resp1: api.ToDiskIsOrganizationExistResponse;
  let resp2: api.ToDiskIsOrganizationExistResponse;

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

    await messageService.processMessage(createOrganizationRequest);

    resp1 = await messageService.processMessage(isOrganizationExistRequest_1);
    resp2 = await messageService.processMessage(isOrganizationExistRequest_2);
  } catch (e) {
    api.logToConsole(e);
  }

  t.is(resp1.payload.isOrganizationExist, true);
  t.is(resp2.payload.isOrganizationExist, false);
});
