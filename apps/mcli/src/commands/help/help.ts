import { Command } from 'clipanion';

export class HelpCommand extends Command {
  static paths = [[`help`], [`-h`], [`--help`]];

  static usage = Command.Usage({
    description: 'Print help',
    examples: [['Print help', 'mprove help']]
  });

  async execute() {
    this.context.stdout.write(this.cli.usage());
  }
}
