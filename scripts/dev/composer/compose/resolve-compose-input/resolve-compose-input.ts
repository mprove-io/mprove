import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep
} from 'node:path';
import { Result } from '@praha/byethrow';
import type { ResolveComposeInputError } from '../../types/function-errors/resolve-compose-input-error';

export type ResolvedComposeInput = {
  ignoredRelativePaths: string[];
  manifestPath: string;
  outputPath: string;
  sourceDirectory: string;
};

type ResolvedPaths = {
  manifestPath: string;
  outputPath: string;
};

export function resolveComposeInput(item: {
  argv: string[];
}): Result.Result<ResolvedComposeInput, ResolveComposeInputError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v => {
      if (v.argv.length !== 2) {
        return Result.fail({
          code: 'COMPOSER_ARGUMENT_COUNT_INVALID',
          message: 'Usage: pnpm composer <manifest-path> <output-file>'
        });
      }

      return Result.succeed();
    }),
    Result.map(
      (v): ResolvedPaths => ({
        manifestPath: resolve(process.cwd(), v.argv[0]),
        outputPath: resolve(process.cwd(), v.argv[1])
      })
    ),
    Result.andThrough(v => {
      if (v.manifestPath === v.outputPath) {
        return Result.fail({
          code: 'COMPOSER_MANIFEST_OUTPUT_PATH_CONFLICT',
          message: 'The manifest and output paths must be different'
        });
      }

      return Result.succeed();
    }),
    Result.map((v): ResolvedComposeInput => {
      let sourceDirectory: string = dirname(v.manifestPath);

      let ignoredRelativePaths: string[] = [basename(v.manifestPath)];

      let relativeOutputPath: string = relative(sourceDirectory, v.outputPath);

      if (
        relativeOutputPath.length > 0 &&
        relativeOutputPath !== '..' &&
        !relativeOutputPath.startsWith(`..${sep}`) &&
        !isAbsolute(relativeOutputPath)
      ) {
        let normalizedRelativeOutputPath: string = relativeOutputPath
          .split(sep)
          .join('/');

        ignoredRelativePaths.push(normalizedRelativeOutputPath);
      }

      return {
        ignoredRelativePaths: ignoredRelativePaths,
        manifestPath: v.manifestPath,
        outputPath: v.outputPath,
        sourceDirectory: sourceDirectory
      };
    })
  );
}
