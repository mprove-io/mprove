import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep
} from 'node:path';
import { Result } from '@praha/byethrow';
import { validateSourceDirectory } from './01-validate-source-directory/validate-source-directory';
import { validateDirectorySectionFiles } from './02-validate-directory-section-files/validate-directory-section-files';
import { loadManifest } from './03-load-manifest/load-manifest';
import { createMarkdown } from './04-create-markdown/create-markdown';
import { writeOutput } from './05-write-output/write-output';
import type { ComposerError } from './types/errors/composer-error';
import type { Manifest } from './types/manifest';

type SourceManifest = {
  manifest: Manifest;
  sourceDirectory: string;
};

function main(item: { argv: string[] }): Result.Result<void, ComposerError> {
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

  return Result.pipe(
    Result.succeed(sourceDirectory),
    Result.andThrough(
      (path: string): Result.Result<void, ComposerError> =>
        validateSourceDirectory({ sourceDirectory: path })
    ),
    Result.andThrough(
      (path: string): Result.Result<void, ComposerError> =>
        validateDirectorySectionFiles({ sourceDirectory: path })
    ),
    Result.andThen(
      (path: string): Result.Result<SourceManifest, ComposerError> =>
        Result.map(
          (manifest: Manifest): SourceManifest => ({
            manifest: manifest,
            sourceDirectory: path
          })
        )(
          loadManifest({
            ignoredRelativePaths: ignoredRelativePaths,
            manifestPath: manifestPath,
            sourceDirectory: path
          })
        )
    ),
    Result.andThen(
      (value: SourceManifest): Result.Result<string, ComposerError> =>
        createMarkdown({
          manifest: value.manifest,
          sourceDirectory: value.sourceDirectory
        })
    ),
    Result.andThen(
      (markdown: string): Result.Result<void, ComposerError> =>
        writeOutput({
          markdown: markdown,
          outputPath: outputPath
        })
    ),
    Result.map((): void => {
      console.log(`Wrote ${outputPath}`);
    })
  );
}

let argv: string[] = process.argv.slice(2);

let result: Result.Result<void, ComposerError> = main({ argv: argv });

if (result.type === 'Failure') {
  console.error(result.error);

  process.exitCode = 1;
}
