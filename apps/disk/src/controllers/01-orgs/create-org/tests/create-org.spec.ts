import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';
let testId = 'disk-create-org';

let traceId = testId;
let orgId = testId;

test('1', async t => {
  let resp: apiToDisk.ToDiskIsOrgExistResponse;

  let wLogger;

  try {
    let { messageService, logger } = await prepareTest(orgId);
    wLogger = logger;

    let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
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

    resp = await messageService.processMessage(isOrgExistRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: wLogger
    });
  }

  t.is(resp.payload.isOrgExist, true);
});
