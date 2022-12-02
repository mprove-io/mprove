import { Command } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';
import { CustomCommand } from '~mcli/models/custom-command';

export class VersionCommand extends CustomCommand {
  static paths = [[`-v`], [`--version`]];

  static usage = Command.Usage({
    description: 'Print version of Mprove CLI',
    examples: [['Print version of Mprove CLI', 'mprove --version']]
  });

  async execute() {
    if (common.isUndefined(this.context.config)) {
      this.context.config = getConfig();
    }

    let version = this.cli.binaryVersion;

    if (common.isDefined(version)) {
      this.context.stdout.write(`${version}\n`);
    } else {
      this.context.stdout.write(`unknown`);
    }
  }
}
