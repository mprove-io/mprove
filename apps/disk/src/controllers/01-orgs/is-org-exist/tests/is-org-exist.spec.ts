import test from 'ava';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { ToDiskCreateOrgRequest } from '#common/interfaces/to-disk/01-orgs/to-disk-create-org';
import {
  ToDiskIsOrgExistRequest,
  ToDiskIsOrgExistResponse
} from '#common/interfaces/to-disk/01-orgs/to-disk-is-org-exist';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';

let testId = 'disk-is-org-exist';

let traceId = testId;
let orgId = testId;

test('1', async t => {
  let resp1: ToDiskIsOrgExistResponse;
  let resp2: ToDiskIsOrgExistResponse;

  let wLogger;
  let configService;

  try {
    let { messageService, diskTabService, logger, cs } =
      await prepareTest(orgId);
    wLogger = logger;
    configService = cs;

    let createOrgRequest: ToDiskCreateOrgRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let isOrgExistRequest_1: ToDiskIsOrgExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsOrgExist,
        traceId: traceId
      },
      payload: {
        orgId: orgId
      }
    };

    let isOrgExistRequest_2: ToDiskIsOrgExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsOrgExist,
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
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp1.payload.isOrgExist, true);
  t.is(resp2.payload.isOrgExist, false);
});
