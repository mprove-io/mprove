import test from 'ava';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { VersionCommand } from '../version';
let testId = 'version';

test('1', async t => {
  let context: CustomContext;
  let code: number;

  let commandLine = `version \
--json`;

  try {
    let { cli, mockContext } = await prepareTest({
      command: VersionCommand,
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

  let parsedOutput: any;

  try {
    parsedOutput = JSON.parse(context.stdout.toString());
  } catch (e) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      context: context,
      isJson: true
    });
  }

  let isPass = code === 0 && common.isDefined(parsedOutput?.versionMproveCLI);

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(common.isDefined(parsedOutput?.versionMproveCLI), true);
});
