import test from 'ava';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { ToDiskCreateOrgRequest } from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import {
  ToDiskIsOrgExistRequest,
  ToDiskIsOrgExistResponse
} from '~common/interfaces/to-disk/01-orgs/to-disk-is-org-exist';
import { logToConsoleDisk } from '~disk/functions/log-to-console-disk';
import { prepareTest } from '~disk/functions/prepare-test';
let testId = 'disk-create-org';

let traceId = testId;
let orgId = testId;

test('1', async t => {
  let resp: ToDiskIsOrgExistResponse;

  let wLogger;
  let configService;

  try {
    let { messageService, logger, cs } = await prepareTest(orgId);
    wLogger = logger;
    configService = cs;

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

    let isOrgExistRequest: ToDiskIsOrgExistRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskIsOrgExist,
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
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }

  t.is(resp.payload.isOrgExist, true);
});
