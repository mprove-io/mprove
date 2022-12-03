import { Command } from 'clipanion';

export class DefinitionsCommand extends Command {
  static paths = [[`definitions`]];

  static usage = Command.Usage({
    description: 'Print the CLI definitions',
    examples: [['Print the CLI definitions', 'mprove definitions']]
  });

  async execute() {
    this.context.stdout.write(
      `${JSON.stringify(this.cli.definitions(), null, 2)}\n`
    );
  }
}
