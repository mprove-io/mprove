import { BaseContext, Command } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';

export interface CustomContext extends BaseContext {
  config: interfaces.Config;
}

export class CustomCommand extends Command<CustomContext> {
  async catch(e: any) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      config: this.context.config
    });

    throw e;
  }

  async execute(): Promise<number | void> {
    return this.execute();
  }
}
