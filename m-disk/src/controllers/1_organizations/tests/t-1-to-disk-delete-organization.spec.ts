import { api } from '../../../barrels/api';
import { prepareTest } from '../../../functions/prepare-test';
import test from 'ava';

let testId = 't-1-to-disk-delete-organization';

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

    await messageService.makeResponse(createOrganizationRequest);
    await messageService.makeResponse(deleteOrganizationRequest);

    resp = await messageService.makeResponse(isOrganizationExistRequest);
  } catch (e) {
    api.logToConsole(e);
  }
  t.is(resp.payload.isOrganizationExist, false);
});
