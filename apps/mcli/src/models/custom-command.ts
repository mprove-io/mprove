import { BaseContext, Command } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { interfaces } from '~mcli/barrels/interfaces';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';

export interface CustomContext extends BaseContext {
  config: interfaces.Config;
  loginToken: string;
}

export class CustomCommand extends Command<CustomContext> {
  async catch(e: any) {
    logToConsoleMcli({
      log: e,
      logLevel: common.LogLevelEnum.Error,
      context: this.context,
      isJson: false
    });

    throw e;
  }

  async execute(): Promise<number | void> {
    return this.execute();
  }
}
