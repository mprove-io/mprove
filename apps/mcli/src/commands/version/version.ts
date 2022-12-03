import { Command } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';

export class VersionCommand extends Command {
  static paths = [[`version`], [`-v`], [`--version`]];

  static usage = Command.Usage({
    description: 'Print version of Mprove CLI',
    examples: [['Print version of Mprove CLI', 'mprove version']]
  });

  async execute() {
    let version = this.cli.binaryVersion;

    let log = common.isDefined(version) ? `${version}\n` : `unknown\n`;

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context as any
    });
  }
}
