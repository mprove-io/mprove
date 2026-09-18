import { resolve } from 'node:path';
import type { ResolvedComposeInput } from '../../../types/resolved-compose-input';

export function resolveComposePaths(item: {
  argv: string[];
}): ResolvedComposeInput {
  let { argv } = item;

  let resolvedComposeInput: ResolvedComposeInput = {
    contentDirectory: resolve(process.cwd(), argv[1]),
    manifestPath: resolve(process.cwd(), argv[0]),
    outputPath: resolve(process.cwd(), argv[2])
  };

  return resolvedComposeInput;
}
