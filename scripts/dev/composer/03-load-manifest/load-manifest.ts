import { Result } from '@praha/byethrow';
import { readTextFile } from '../shared/read-text-file/read-text-file';
import type { ComposerError } from '../types/errors/composer-error';
import type { Manifest } from '../types/manifest';
import { parseManifest } from './02-parse-manifest/parse-manifest';
import { validateManifest } from './03-validate-manifest/validate-manifest';

export function loadManifest(item: {
  ignoredRelativePaths: string[];
  manifestPath: string;
  sourceDirectory: string;
}): Result.Result<Manifest, ComposerError> {
  let { ignoredRelativePaths, manifestPath, sourceDirectory } = item;

  return Result.pipe(
    Result.succeed(manifestPath),
    Result.andThen(path => readTextFile({ filePath: path })),
    Result.andThen(content =>
      parseManifest({
        content: content,
        manifestPath: manifestPath
      })
    ),
    Result.andThrough(manifest =>
      validateManifest({
        ignoredRelativePaths: ignoredRelativePaths,
        manifest: manifest,
        sourceDirectory: sourceDirectory
      })
    )
  );
}
