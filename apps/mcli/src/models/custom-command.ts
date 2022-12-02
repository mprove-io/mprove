import { Command } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';

export class CustomCommand extends Command {
  config: interfaces.Config;

  constructor() {
    super();
    this.config = getConfig();
  }

  async catch(e: any) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      config: this.config
    });

    throw e;
  }

  async execute(): Promise<number | void> {
    return this.execute();
  }
}
