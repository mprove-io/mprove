import { Result } from '@praha/byethrow';
import { resolveComposeInput } from './01-resolve-compose-input/resolve-compose-input';
import { validateSourceDirectory } from './02-validate-source-directory/validate-source-directory';
import { validateDirectorySectionFiles } from './03-validate-directory-section-files/validate-directory-section-files';
import { loadManifest } from './04-load-manifest/load-manifest';
import { createMarkdown } from './05-create-markdown/create-markdown';
import { writeOutput } from './06-write-output/write-output';
import type { ComposeError } from './types/function-errors/compose-error';
import type { CreateMarkdownError } from './types/function-errors/create-markdown-error';
import type { LoadManifestError } from './types/function-errors/load-manifest-error';
import type { ResolveComposeInputError } from './types/function-errors/resolve-compose-input-error';
import type { Manifest } from './types/manifest';
import type { ResolvedComposeInput } from './types/resolved-compose-input';

function compose(item: { argv: string[] }): Result.Result<void, ComposeError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThen(
      (v): Result.Result<ResolvedComposeInput, ResolveComposeInputError> =>
        resolveComposeInput({ argv: v.argv })
    ),
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
