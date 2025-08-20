import { Command, Option } from 'clipanion';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { isDefined } from '~common/functions/is-defined';
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

    let log = {
      mproveCLI: isDefined(version) ? version : 'unknown'
    };

    logToConsoleMcli({
      log: log,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
