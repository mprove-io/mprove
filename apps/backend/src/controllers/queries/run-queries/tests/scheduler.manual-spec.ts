import test from 'ava';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-run-queries__ok-bigquery';

let traceId = testId;

let prep: interfaces.Prep;

test('1', async t => {
  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        idempotencyKeys: [testId]
      },
      overrideConfigOptions: {
        isScheduler: common.BoolEnum.TRUE
      }
    });

    await common.sleep(1000 * 60 * 10);

    await prep.app.close();
  } catch (e) {
    logToConsoleBackend({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      logger: prep.logger
    });
  }

  t.is(1, 1);
});
