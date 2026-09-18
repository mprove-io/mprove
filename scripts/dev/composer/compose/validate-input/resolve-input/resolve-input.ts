import { resolve } from 'node:path';
import type { ComposeInput } from '../../../types/compose-input';

export function resolveInput(item: { argv: string[] }): ComposeInput {
  let { argv } = item;

  let composeInput: ComposeInput = {
    contentDirectory: resolve(process.cwd(), argv[1]),
    manifestPath: resolve(process.cwd(), argv[0]),
    outputPath: resolve(process.cwd(), argv[2])
  };

  return composeInput;
}
