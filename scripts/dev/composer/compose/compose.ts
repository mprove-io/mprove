import { Result } from '@praha/byethrow';
import type { ComposeError } from '../types/function-errors/compose-error';
import type { CreateMarkdownError } from '../types/function-errors/create-markdown-error';
import type { LoadManifestError } from '../types/function-errors/load-manifest-error';
import type { ValidateInputError } from '../types/function-errors/validate-input-error';
import type { Manifest } from '../types/manifest';
import type { ResolvedComposeInput } from '../types/resolved-compose-input';
import { createMarkdown } from './create-markdown/create-markdown';
import { loadManifest } from './load-manifest/load-manifest';
import { validateInput } from './validate-input/validate-input';
import { writeOutput } from './write-output/write-output';

export function compose(item: {
  argv: string[];
}): Result.Result<void, ComposeError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThen(
      (v): Result.Result<ResolvedComposeInput, ValidateInputError> =>
        validateInput({ argv: v.argv })
    ),
    Result.bind(
      'manifest',
      (v): Result.Result<Manifest, LoadManifestError> =>
        loadManifest({
          contentDirectory: v.contentDirectory,
          manifestPath: v.manifestPath
        })
    ),
    Result.bind(
      'markdown',
      (v): Result.Result<string, CreateMarkdownError> =>
        createMarkdown({
          contentDirectory: v.contentDirectory,
          manifest: v.manifest
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
