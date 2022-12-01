import { Command } from 'clipanion';

export class CliDefinitionsCommand extends Command {
  static paths = [[`cli-definitions`]];

  static usage = Command.Usage({
    description: 'Print the CLI definitions',
    examples: [['Print the CLI definitions', 'mprove cli-definitions']]
  });

  async execute() {
    this.context.stdout.write(
      `${JSON.stringify(this.cli.definitions(), null, 2)}\n`
    );

    return 0;
  }
}
