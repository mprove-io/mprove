import { BaseContext, Cli, CommandClass } from 'clipanion';
import { common } from '~mcli/barrels/common';
import { getConfig } from '~mcli/config/get.config';

export async function prepareTest(item?: {
  command?: CommandClass<BaseContext>;
}) {
  let prepConfig = getConfig();

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
    enableCapture: true,
    binaryLabel: `Mprove`,
    binaryName: `mprove`,
    binaryVersion: require('../../../../package.json').version
  });

  if (common.isDefined(item?.command)) {
    cli.register(item.command);
  }

  let mockContext = createMockContext();

  return {
    prepConfig: prepConfig,
    mockContext: mockContext,
    cli: cli
  };
}
