import test from 'ava';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-is-org-exist';

let traceId = testId;
let orgId = testId;

test('1', async t => {
  let resp1: apiToDisk.ToDiskIsOrgExistResponse;
  let resp2: apiToDisk.ToDiskIsOrgExistResponse;

  let wLogger;
  let configService;

  try {
    let { messageService, logger, cs } = await prepareTest(orgId);
    wLogger = logger;
    configService = cs;

    let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let isOrgExistRequest_1: apiToDisk.ToDiskIsOrgExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrgExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let isOrgExistRequest_2: apiToDisk.ToDiskIsOrgExistRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskIsOrgExist,
        traceId: traceId
      },
      payload: {
        orgId: 'unknown_org'
      }
    };

    await messageService.processMessage(createOrgRequest);

    resp1 = await messageService.processMessage(isOrgExistRequest_1);
    resp2 = await messageService.processMessage(isOrgExistRequest_2);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp1.payload.isOrgExist, true);
  t.is(resp2.payload.isOrgExist, false);
});
