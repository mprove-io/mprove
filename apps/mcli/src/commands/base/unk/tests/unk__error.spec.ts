import test from 'ava';
import { common } from '~mcli/barrels/common';
import { constants } from '~mcli/barrels/constants';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
let retry = require('async-retry');

let testId = 'unk__error';

test('1', async t => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  await retry(async (bail: any) => {
    let commandLine = `unk`;

    try {
      let { cli, mockContext } = await prepareTest({
        command: undefined,
        config: undefined
      });

      context = mockContext as any;

      code = await cli.run(commandLine.split(' '), context);
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: common.LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    isPass =
      code === 1 &&
      context.stdout.toString().includes('Command not found') === true;
  }, constants.RETRY_OPTIONS).catch((er: any) => {
    logToConsoleMcli({
      log: er,
      logLevel: common.LogLevelEnum.Error,
      context: undefined,
      isJson: false
    });
  });

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 1);
  t.is(context.stdout.toString().includes('Command not found'), true);
});
