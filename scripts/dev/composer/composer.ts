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
import type { ComposeError } from './types/function-errors/compose-error';
import type { CreateMarkdownError } from './types/function-errors/create-markdown-error';
import type { LoadManifestError } from './types/function-errors/load-manifest-error';
import type { Manifest } from './types/manifest';

function compose(item: { argv: string[] }): Result.Result<void, ComposeError> {
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
    Result.succeed({
      ignoredRelativePaths: ignoredRelativePaths,
      manifestPath: manifestPath,
      outputPath: outputPath,
      sourceDirectory: sourceDirectory
    }),
    Result.andThrough(v =>
      validateSourceDirectory({ sourceDirectory: v.sourceDirectory })
    ),
    Result.andThrough(v =>
      validateDirectorySectionFiles({ sourceDirectory: v.sourceDirectory })
    ),
    Result.bind(
      'manifest',
      (v): Result.Result<Manifest, LoadManifestError> =>
        loadManifest({
          ignoredRelativePaths: v.ignoredRelativePaths,
          manifestPath: v.manifestPath,
          sourceDirectory: v.sourceDirectory
        })
    ),
    Result.bind(
      'markdown',
      (v): Result.Result<string, CreateMarkdownError> =>
        createMarkdown({
          manifest: v.manifest,
          sourceDirectory: v.sourceDirectory
        })
    ),
    Result.andThrough(v =>
      writeOutput({ markdown: v.markdown, outputPath: v.outputPath })
    ),
    Result.map((v): void => {
      console.log(`Wrote ${v.outputPath}`);
    })
  );
}

let argv: string[] = process.argv.slice(2);

let result: Result.Result<void, ComposeError> = compose({ argv: argv });

if (result.type === 'Failure') {
  console.error(result.error);

  process.exitCode = 1;
}
