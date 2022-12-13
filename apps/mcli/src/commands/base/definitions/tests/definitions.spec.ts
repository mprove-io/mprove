import test from 'ava';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { DefinitionsCommand } from '../definitions';
let testId = 'definitions';

test('1', async t => {
  let context: CustomContext;
  let code: number;

  try {
    let { cli, mockContext } = await prepareTest({
      command: DefinitionsCommand,
      config: undefined
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

  let isPass = code === 0;

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
});
