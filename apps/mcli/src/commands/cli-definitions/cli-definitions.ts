import { Command } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { CustomCommand } from '~mcli/models/custom-command';

export class CliDefinitionsCommand extends CustomCommand {
  static paths = [[`cli-definitions`]];

  static usage = Command.Usage({
    description: 'Print the CLI definitions',
    examples: [['Print the CLI definitions', 'mprove cli-definitions']]
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    this.context.stdout.write(
      `${JSON.stringify(this.cli.definitions(), null, 2)}\n`
    );
  }
}
