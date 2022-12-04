import test from 'ava';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { RunVisualizationsCommand } from '../run-visualizations';
let testId =
  'run visualizations -p DXYE72ODCP5LWPWH2EXQ --production -b main -e prod';

test('1', async t => {
  let config: interfaces.Config;
  let context: any;
  let code: any;

  try {
    let { cli, mockContext, prepConfig } = await prepareTest({
      command: RunVisualizationsCommand,
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
      context: context
    });
  }

  let isPass =
    code === 0 && context.stdout.toString().includes('Queries running');

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(context.stdout.toString().includes('Queries running'), true);
});
