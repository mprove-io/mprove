import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'delete-organization';

let traceId = '123';
let organizationId = testId;

test('1', async t => {
  let resp: apiToDisk.ToDiskIsOrganizationExistResponse;

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

    let deleteOrganizationRequest: apiToDisk.ToDiskDeleteOrganizationRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrganization,
        traceId: traceId
      },
      payload: {
        organizationId: organizationId
      }
    };

    let isOrganizationExistRequest: apiToDisk.ToDiskIsOrganizationExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrganizationExist,
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
    common.logToConsole(e);
  }
  t.is(resp.payload.isOrganizationExist, false);
});
