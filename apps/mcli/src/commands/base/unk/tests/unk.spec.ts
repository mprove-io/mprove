import test from 'ava';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';

let testId = 'unk';

test('1', async t => {
  let context;
  let code;

  try {
    let { cli, mockContext } = await prepareTest({
      command: undefined,
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
    code === 1 &&
    context.stdout.toString().includes(`Command not found`) === true;

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 1);
  t.is(context.stdout.toString().includes(`Command not found`), true);
});
