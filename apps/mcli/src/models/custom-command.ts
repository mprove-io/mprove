import { BaseContext, Command } from 'clipanion';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { McliConfig } from '#mcli/config/mcli-config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';

export interface CustomContext extends BaseContext {
  config: McliConfig;
  loginToken: string;
}

export class CustomCommand extends Command<CustomContext> {
  async catch(e: any) {
    logToConsoleMcli({
      log: e,
      logLevel: LogLevelEnum.Error,
      context: this.context,
      isJson: false
    });

    throw e;
  }

  async execute(): Promise<number | void> {
    return this.execute();
  }
}
