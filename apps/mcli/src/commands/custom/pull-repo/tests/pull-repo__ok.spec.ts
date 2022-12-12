import test from 'ava';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { PullRepoCommand } from '../pull-repo';
let testId =
  'pull repo --projectId DXYE72ODCP5LWPWH2EXQ --repo production ' +
  '--branch main --env prod';

test('1', async t => {
  let config: interfaces.Config;
  let context: CustomContext;
  let code: any;

  try {
    let cfg = getConfig();

    let { cli, mockContext, prepConfig, loginToken } = await prepareTest({
      command: PullRepoCommand,
      isPrepConfig: true,
      loginEmail: cfg.mproveCliEmail,
      loginPassword: cfg.mproveCliPassword
    });

    config = prepConfig;
    context = mockContext as any;

    context.config = prepConfig;
    context.loginToken = loginToken;

    code = await cli.run([...testId.split(' ')], context);
  } catch (e) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      context: context,
      isJson: true
    });
  }

  let isPass = code === 0 && context.stdout.toString().includes('errorsTotal');

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(context.stdout.toString().includes('errorsTotal'), true);
});
