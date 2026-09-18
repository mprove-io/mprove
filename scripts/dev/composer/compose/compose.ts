import { Result } from '@praha/byethrow';
import type { ComposeError } from '../types/function-errors/compose-error';
import type { CreateMarkdownError } from '../types/function-errors/create-markdown-error';
import type { LoadManifestError } from '../types/function-errors/load-manifest-error';
import type { ResolveComposeInputError } from '../types/function-errors/resolve-compose-input-error';
import type { Manifest } from '../types/manifest';
import { createMarkdown } from './create-markdown/create-markdown';
import { loadManifest } from './load-manifest/load-manifest';
import {
  type ResolvedComposeInput,
  resolveComposeInput
} from './resolve-compose-input/resolve-compose-input';
import { validateDirectorySectionFiles } from './validate-directory-section-files/validate-directory-section-files';
import { validateSourceDirectory } from './validate-source-directory/validate-source-directory';
import { writeOutput } from './write-output/write-output';

export function compose(item: {
  argv: string[];
}): Result.Result<void, ComposeError> {
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
