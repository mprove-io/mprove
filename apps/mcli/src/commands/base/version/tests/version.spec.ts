import test from 'ava';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { VersionCommand } from '../version';
let testId = 'version';

test('1', async t => {
  let context;
  let code;

  try {
    let { cli, mockContext } = await prepareTest({
      command: VersionCommand,
      isPrepConfig: false
    });

    context = mockContext as any;

    code = await cli.run([testId], context);
  } catch (e) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      context: context,
      isJson: true
    });
  }

  let isPass =
    code === 0 && context.stdout.toString().includes('Mprove CLI version');

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(context.stdout.toString().includes('Mprove CLI version'), true);
});