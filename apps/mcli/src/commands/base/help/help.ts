import { Command } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';

export class HelpCommand extends Command {
  static paths = [[`help`], [`-h`], [`--help`]];

  static usage = Command.Usage({
    description: 'Print help',
    examples: [['Print help', 'mprove help']]
  });

  async execute() {
    let log = this.cli.usage();

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: false,
      isInspect: false
    });
  }
}
