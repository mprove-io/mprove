import { basename, dirname, isAbsolute, relative, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import { createMarkdown } from './functions/create-markdown';
import { loadManifest } from './functions/load-manifest';
import { validateSourceDirectory } from './functions/validate-source-directory';
import { writeOutput } from './functions/write-output';
import type { ScriptError } from './types/errors/script-error';
import type { Manifest } from './types/manifest';

type SourceManifest = {
  manifest: Manifest;
  sourceDirectory: string;
};

function main(item: { argv: string[] }): Result.Result<void, ScriptError> {
  let { argv } = item;

  if (argv.length !== 2) {
    return Result.fail({
      code: 'SCRIPT_USAGE_ERROR',
      message: 'Usage: pnpm build-agents-next <manifest-path> <output-file>'
    });
  }

  let manifestPath: string = resolve(process.cwd(), argv[0]);

  let outputPath: string = resolve(process.cwd(), argv[1]);

  if (manifestPath === outputPath) {
    return Result.fail({
      code: 'SCRIPT_USAGE_ERROR',
      message: 'The manifest and output paths must be different'
    });
  }

  let sourceDirectory: string = dirname(manifestPath);

  let ignoredRelativePaths: string[] = [basename(manifestPath)];

  let relativeOutputPath: string = relative(sourceDirectory, outputPath);

  let outputIsInSource: boolean =
    relativeOutputPath.length > 0 &&
    !relativeOutputPath.startsWith('..') &&
    !isAbsolute(relativeOutputPath);

  if (outputIsInSource) {
    ignoredRelativePaths.push(relativeOutputPath);
  }

  return Result.pipe(
    Result.succeed(sourceDirectory),
    Result.andThrough(
      (path: string): Result.Result<void, ScriptError> =>
        validateSourceDirectory({ sourceDirectory: path })
    ),
    Result.andThen(
      (path: string): Result.Result<SourceManifest, ScriptError> =>
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
      (value: SourceManifest): Result.Result<string, ScriptError> =>
        createMarkdown({
          manifest: value.manifest,
          sourceDirectory: value.sourceDirectory
        })
    ),
    Result.andThen(
      (markdown: string): Result.Result<void, ScriptError> =>
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

let result: Result.Result<void, ScriptError> = main({ argv: argv });

if (result.type === 'Failure') {
  console.error(result.error.message);

  process.exitCode = 1;
}
