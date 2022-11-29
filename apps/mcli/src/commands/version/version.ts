import { Command } from 'clipanion';

export class VersionCommand extends Command {
  static paths = [['version']];

  static usage = Command.Usage({
    description: 'Get the current version of Mprove CLI',
    examples: [['Get the current version of Mprove CLI', 'mprove version']]
  });

  async execute() {
    let readPkgUp = require('read-pkg-up');
    let rpj = readPkgUp.sync();

    this.context.stdout.write(`version is ${rpj.packageJson.version}\n`);

    return 0;
  }
}
