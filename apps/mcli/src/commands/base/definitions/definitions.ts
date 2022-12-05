import { Command, Option } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';

export class DefinitionsCommand extends Command {
  static paths = [['definitions']];

  static usage = Command.Usage({
    description: 'Print the CLI definitions',
    examples: [['Print the CLI definitions', 'mprove definitions']]
  });

  json = Option.Boolean('-j,--json', false, {
    description: '(default false)'
  });

  async execute() {
    let log = this.cli.definitions();

    logToConsoleMcli({
      log: log,
      logLevel: common.LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
