import { Command } from 'clipanion';

import { logToConsoleMcli } from '#mcli/functions/top/log-to-console-mcli/log-to-console-mcli';

export class HelpCommand extends Command {
  static paths = [['help'], ['-h'], ['--help']];

  static usage = Command.Usage({
    description: 'Print help',
    examples: [['Print help', 'mprove help']]
  });

  async execute() {
    let log = this.cli.usage();

    logToConsoleMcli({
      log: log,
      logLevel: 'Info',
      context: this.context,
      isJson: false,
      isPretty: false
    });
  }
}
