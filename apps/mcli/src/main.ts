import { Cli, Command, Option } from 'clipanion';
import 'module-alias/register';
import 'reflect-metadata';
import { common } from './barrels/common';
import { nodeCommon } from './barrels/node-common';

nodeCommon.logToConsole({
  log: '123',
  logLevel: common.LogLevelEnum.Info,
  logger: undefined,
  logIsJson: false
});

class MpclibConfigGet extends Command {
  static paths = [['config', 'get']];

  parameter = Option.String();

  home = Option.Boolean(`--home`);

  async execute(): Promise<number | void> {
    let what = this.home ? `home config value` : `local config value`;

    console.log(`Getting ${what} for ${this.parameter}`);
  }
}

Cli.from([MpclibConfigGet]).runExit(process.argv.slice(2), Cli.defaultContext);
