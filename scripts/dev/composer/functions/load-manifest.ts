import { Result } from '@praha/byethrow';
import type { ScriptError } from '../types/errors/script-error';
import type { Manifest } from '../types/manifest';
import { parseManifest } from './load/parse-manifest';
import { validateManifest } from './load/validate-manifest';
import { readTextFile } from './parts/read-text-file';

export function loadManifest(item: {
  ignoredRelativePaths: string[];
  manifestPath: string;
  sourceDirectory: string;
}): Result.Result<Manifest, ScriptError> {
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
