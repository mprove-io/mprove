import test from 'ava';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { RunDashboardsCommand } from '../run-dashboards';
let testId = 'run dashboards';

test('1', async t => {
  let config: interfaces.Config;
  let context: any;
  let code: any;

  try {
    let { cli, mockContext, prepConfig } = await prepareTest({
      command: RunDashboardsCommand
    });

    config = prepConfig;
    context = mockContext as any;

    context.config = prepConfig;
    // (context.config as interfaces.Config).mproveCliProjectId = 'abc';

    code = await cli.run([...testId.split(' ')], context);
  } catch (e) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      config: config
    });
  }

  let isPass = code === 0;

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(isPass, true);
});
