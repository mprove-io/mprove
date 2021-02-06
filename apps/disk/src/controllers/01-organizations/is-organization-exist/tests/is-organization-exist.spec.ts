import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'is-organization-exist';

let traceId = '123';
let organizationId = testId;

test('1', async t => {
  let resp1: apiToDisk.ToDiskIsOrganizationExistResponse;
  let resp2: apiToDisk.ToDiskIsOrganizationExistResponse;

  try {
    let { messageService } = await prepareTest(organizationId);

    let createOrganizationRequest: apiToDisk.ToDiskCreateOrganizationRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrganization,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId
      }
    };

    let isOrganizationExistRequest_1: apiToDisk.ToDiskIsOrganizationExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId
      }
    };

    let isOrganizationExistRequest_2: apiToDisk.ToDiskIsOrganizationExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist,
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
    common.logToConsole(e);
  }

  t.is(resp1.payload.isOrganizationExist, true);
  t.is(resp2.payload.isOrganizationExist, false);
});
