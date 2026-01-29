import test from 'ava';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { ToDiskCreateOrgRequest } from '#common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ToDiskDeleteOrgRequest } from '#common/interfaces/to-disk/01-orgs/to-disk-delete-org';
import {
  ToDiskIsOrgExistRequest,
  ToDiskIsOrgExistResponse
} from '#common/interfaces/to-disk/01-orgs/to-disk-is-org-exist';
import { logToConsoleDisk } from '#disk/functions/log-to-console-disk';
import { prepareTest } from '#disk/functions/prepare-test';

let testId = 'disk-delete-org';

let traceId = testId;
let orgId = testId;

test('1', async t => {
  let resp: ToDiskIsOrgExistResponse;

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

    let deleteOrgRequest: ToDiskDeleteOrgRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
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
    await messageService.processMessage(deleteOrgRequest);

    resp = await messageService.processMessage(isOrgExistRequest);
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }
  t.is(resp.payload.isOrgExist, false);
});
