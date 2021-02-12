import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'delete-org';

let traceId = '123';
let orgId = testId;

test('1', async t => {
  let resp: apiToDisk.ToDiskIsOrgExistResponse;

  try {
    let { messageService } = await prepareTest(orgId);
    let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let deleteOrgRequest: apiToDisk.ToDiskDeleteOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let isOrgExistRequest: apiToDisk.ToDiskIsOrgExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrgExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    await messageService.processMessage(createOrgRequest);
    await messageService.processMessage(deleteOrgRequest);

    resp = await messageService.processMessage(isOrgExistRequest);
  } catch (e) {
    common.logToConsole(e);
  }
  t.is(resp.payload.isOrgExist, false);
});
