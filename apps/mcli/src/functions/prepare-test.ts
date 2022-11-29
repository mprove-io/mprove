import { BaseContext, Cli, CommandClass } from 'clipanion';
import { common } from '~mcli/barrels/common';

export async function prepareTest(item?: {
  command?: CommandClass<BaseContext>;
}) {
  let createMockContext = () => {
    let out = '';
    let err = '';

    return {
      stderr: {
        toString: () => err,
        write: (input: string) => {
          err += input;
        }
      },
      stdout: {
        toString: () => out,
        write: (input: string) => {
          out += input;
        }
      }
    };
  };

  let cli = new Cli({
    enableCapture: true
  });

  if (common.isDefined(item?.command)) {
    cli.register(item.command);
  }

  let mockContext = createMockContext();

  return {
    mockContext: mockContext,
    cli: cli
  };
}
