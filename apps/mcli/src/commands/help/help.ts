import { Command } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { CustomCommand } from '~mcli/models/custom-command';

export class HelpCommand extends CustomCommand {
  static paths = [[`-h`], [`--help`]];

  static usage = Command.Usage({
    description: 'Print help',
    examples: [['Print help', 'mprove --help']]
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    this.context.stdout.write(this.cli.usage());
  }
}
