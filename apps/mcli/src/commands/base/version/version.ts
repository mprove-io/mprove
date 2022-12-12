import { Command, Option } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';

export class VersionCommand extends Command {
  static paths = [['version']];

  static usage = Command.Usage({
    description: 'Print version of Mprove CLI',
    examples: [['Print version of Mprove CLI', 'mprove version']]
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  async execute() {
    let version = this.cli.binaryVersion;

    let log =
      this.json === false
        ? `Mprove CLI version: ${
            common.isDefined(version) ? version : 'unknown'
          }`
        : {
            mproveCliVersion: common.isDefined(version) ? version : 'unknown'
          };

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json,
      isInspect: false
    });
  }
}
