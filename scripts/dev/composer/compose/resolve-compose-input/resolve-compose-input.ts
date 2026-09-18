import { isAbsolute, relative, resolve, sep } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ResolveComposeInputError } from '../../types/function-errors/resolve-compose-input-error';

export type ResolvedComposeInput = {
  contentDirectory: string;
  manifestPath: string;
  outputPath: string;
};

type ResolvedPaths = {
  contentDirectory: string;
  manifestPath: string;
  outputPath: string;
};

export function resolveComposeInput(item: {
  argv: string[];
}): Result.Result<ResolvedComposeInput, ResolveComposeInputError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v => {
      if (v.argv.length !== 3) {
        return Result.fail({
          code: 'COMPOSER_ARGUMENT_COUNT_INVALID',
          message:
            'Usage: pnpm composer <manifest-path> <content-directory> <output-file>'
        });
      }

      return Result.succeed();
    }),
    Result.map(
      (v): ResolvedPaths => ({
        contentDirectory: resolve(process.cwd(), v.argv[1]),
        manifestPath: resolve(process.cwd(), v.argv[0]),
        outputPath: resolve(process.cwd(), v.argv[2])
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
    Result.andThrough(v => {
      let relativeManifestPath: string = relative(
        v.contentDirectory,
        v.manifestPath
      );

      if (
        relativeManifestPath.length === 0 ||
        (relativeManifestPath !== '..' &&
          !relativeManifestPath.startsWith(`..${sep}`) &&
          !isAbsolute(relativeManifestPath))
      ) {
        return Result.fail({
          code: 'COMPOSER_MANIFEST_PATH_IN_CONTENT_DIRECTORY',
          message: `Manifest path must be outside the content directory: ${v.manifestPath}`,
          path: v.manifestPath
        });
      }

      return Result.succeed();
    }),
    Result.andThrough(v => {
      let relativeOutputPath: string = relative(
        v.contentDirectory,
        v.outputPath
      );

      if (
        relativeOutputPath.length === 0 ||
        (relativeOutputPath !== '..' &&
          !relativeOutputPath.startsWith(`..${sep}`) &&
          !isAbsolute(relativeOutputPath))
      ) {
        return Result.fail({
          code: 'COMPOSER_OUTPUT_PATH_IN_CONTENT_DIRECTORY',
          message: `Output path must be outside the content directory: ${v.outputPath}`,
          path: v.outputPath
        });
      }

      return Result.succeed();
    }),
    Result.map(
      (v): ResolvedComposeInput => ({
        contentDirectory: v.contentDirectory,
        manifestPath: v.manifestPath,
        outputPath: v.outputPath
      })
    )
  );
}
