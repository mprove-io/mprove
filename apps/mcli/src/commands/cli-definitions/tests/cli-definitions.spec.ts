import test from 'ava';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CliDefinitionsCommand } from '../cli-definitions';
let testId = 'cli-definitions';

test('1', async t => {
  let config;
  let context;
  let code;

  try {
    let { cli, mockContext, prepConfig } = await prepareTest({
      command: CliDefinitionsCommand
    });

    config = prepConfig;
    context = mockContext as any;

    context.config = prepConfig;

    code = await cli.run([testId], context);
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
