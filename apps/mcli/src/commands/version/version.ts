import { Command } from 'clipanion';
import { common } from '~mcli/barrels/common';

export class VersionCommand extends Command {
  static paths = [[`-v`], [`--version`]];

  static usage = Command.Usage({
    description: 'Print version of Mprove CLI',
    examples: [['Print version of Mprove CLI', 'mprove --version']]
  });

  async execute() {
    let version = this.cli.binaryVersion;

    if (common.isDefined(version)) {
      this.context.stdout.write(`${version}\n`);
    } else {
      this.context.stdout.write(`unknown`);
    }

    return 0;
  }
}
