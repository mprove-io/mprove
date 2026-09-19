import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ComposeInput } from '../../../types/compose-input';

export function resolveInput(item: {
  argv: string[];
}): Result.Result<ComposeInput, never> {
  let { argv } = item;

  let composeInput: ComposeInput = {
    manifestPath: resolve(process.cwd(), argv[0]),
    contentDirectory: resolve(process.cwd(), argv[1]),
    outputPath: resolve(process.cwd(), argv[2])
  };

  return Result.succeed(composeInput);
}
