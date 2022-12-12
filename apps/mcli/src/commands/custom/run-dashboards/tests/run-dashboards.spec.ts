import test from 'ava';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { RunDashboardsCommand } from '../run-dashboards';
let testId =
  'run dashboards --projectId DXYE72ODCP5LWPWH2EXQ --repo production --branch main ' +
  '--env prod --ids ec1_d1 --wait --seconds 2';

test('1', async t => {
  let config: interfaces.Config;
  let context: any;
  let code: any;

  try {
    let { cli, mockContext, prepConfig } = await prepareTest({
      command: RunDashboardsCommand,
      isPrepConfig: true
    });

    config = prepConfig;
    context = mockContext as any;

    context.config = prepConfig;

    code = await cli.run([...testId.split(' ')], context);
  } catch (e) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      context: context,
      isJson: true
    });
  }

  let isPass = code === 0 && context.stdout.toString().includes('queriesStats');

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(context.stdout.toString().includes('queriesStats'), true);
});
