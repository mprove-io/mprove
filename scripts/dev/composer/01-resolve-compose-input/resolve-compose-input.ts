import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep
} from 'node:path';
import { Result } from '@praha/byethrow';
import type { ResolveComposeInputError } from '../types/function-errors/resolve-compose-input-error';
import type { ResolvedComposeInput } from '../types/resolved-compose-input';

export function resolveComposeInput(item: {
  argv: string[];
}): Result.Result<ResolvedComposeInput, ResolveComposeInputError> {
  let { argv } = item;

  if (argv.length !== 2) {
    return Result.fail({
      code: 'COMPOSER_ARGUMENT_COUNT_INVALID',
      message: 'Usage: pnpm composer <manifest-path> <output-file>'
    });
  }

  let manifestPath: string = resolve(process.cwd(), argv[0]);

  let outputPath: string = resolve(process.cwd(), argv[1]);

  if (manifestPath === outputPath) {
    return Result.fail({
      code: 'COMPOSER_MANIFEST_OUTPUT_PATH_CONFLICT',
      message: 'The manifest and output paths must be different'
    });
  }

  let sourceDirectory: string = dirname(manifestPath);

  let ignoredRelativePaths: string[] = [basename(manifestPath)];

  let relativeOutputPath: string = relative(sourceDirectory, outputPath);

  let outputIsInParent: boolean =
    relativeOutputPath === '..' || relativeOutputPath.startsWith(`..${sep}`);

  let outputIsAbsolute: boolean = isAbsolute(relativeOutputPath);

  let outputIsInSource: boolean =
    relativeOutputPath.length > 0 && !outputIsInParent && !outputIsAbsolute;

  if (outputIsInSource) {
    let normalizedRelativeOutputPath: string = relativeOutputPath
      .split(sep)
      .join('/');

    ignoredRelativePaths.push(normalizedRelativeOutputPath);
  }

  let resolvedComposeInput: ResolvedComposeInput = {
    ignoredRelativePaths: ignoredRelativePaths,
    manifestPath: manifestPath,
    outputPath: outputPath,
    sourceDirectory: sourceDirectory
  };

  return Result.succeed(resolvedComposeInput);
}
