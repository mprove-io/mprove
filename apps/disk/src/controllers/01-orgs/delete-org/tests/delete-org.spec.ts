import test from 'ava';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import type { ToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/create-org/create-org-request';
import type { ToDiskDeleteOrgRequest } from '#common/zod/to-disk/01-orgs/delete-org/delete-org-request';
import type { ToDiskIsOrgExistRequest } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-request';
import type { ToDiskIsOrgExistResponse } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-response';
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
      operation: 'createOrg',
      traceId: traceId,
      input: {
        orgId: orgId
      }
    };

    let deleteOrgRequest: ToDiskDeleteOrgRequest = {
      operation: 'deleteOrg',
      traceId: traceId,
      input: {
        orgId: orgId
      }
    };

    let isOrgExistRequest: ToDiskIsOrgExistRequest = {
      operation: 'isOrgExist',
      traceId: traceId,
      input: {
        orgId: orgId
      }
    };

    await messageService.processRequest({ request: createOrgRequest });
    await messageService.processRequest({ request: deleteOrgRequest });

    resp = await messageService.processRequest({ request: isOrgExistRequest });
  } catch (e) {
    logToConsoleDisk({
      log: e,
      logLevel: LogLevelEnum.Error,
      logger: wLogger,
      cs: configService
    });
  }
  t.is(resp.result.type, 'Success');

  if (resp.result.type !== 'Success') {
    return;
  }

  t.is(resp.result.value.isOrgExist, false);
});
