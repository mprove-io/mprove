import test from 'ava';
import { api } from '~/barrels/api';
import { prepareTest } from '~/functions/prepare-test';

let testId = 'delete-organization';

let traceId = '123';
let organizationId = testId;

test('1', async t => {
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

    await messageService.processMessage(createOrganizationRequest);
    await messageService.processMessage(deleteOrganizationRequest);

    resp = await messageService.processMessage(isOrganizationExistRequest);
  } catch (e) {
    api.logToConsole(e);
  }
  t.is(resp.payload.isOrganizationExist, false);
});