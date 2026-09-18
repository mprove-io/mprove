import type { ResolvedComposeInput } from '../../../types/resolved-compose-input';

export function toResolvedComposeInput(item: {
  contentDirectory: string;
  manifestPath: string;
  outputPath: string;
}): ResolvedComposeInput {
  let resolvedComposeInput: ResolvedComposeInput = {
    contentDirectory: item.contentDirectory,
    manifestPath: item.manifestPath,
    outputPath: item.outputPath
  };

  return resolvedComposeInput;
}
