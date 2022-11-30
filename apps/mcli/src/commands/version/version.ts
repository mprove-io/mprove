import { Command } from 'clipanion';

export class VersionCommand extends Command {
  static paths = [['version']];

  static usage = Command.Usage({
    description: 'Get the current version of Mprove CLI',
    examples: [['Get the current version of Mprove CLI', 'mprove version']]
  });

  async execute() {
    this.context.stdout.write(`version is ${this.cli.binaryVersion}\n`);

    return 0;
  }
}
