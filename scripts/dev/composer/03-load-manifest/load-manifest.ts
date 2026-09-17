import { Result } from '@praha/byethrow';
import { readTextFile } from '../shared/read-text-file/read-text-file';
import type { LoadManifestError } from '../types/function-errors/load-manifest-error';
import type { ParseManifestError } from '../types/function-errors/parse-manifest-error';
import type { ReadTextFileError } from '../types/function-errors/read-text-file-error';
import type { Manifest } from '../types/manifest';
import { parseManifest } from './02-parse-manifest/parse-manifest';
import { validateManifest } from './03-validate-manifest/validate-manifest';

export function loadManifest(item: {
  ignoredRelativePaths: string[];
  manifestPath: string;
  sourceDirectory: string;
}): Result.Result<Manifest, LoadManifestError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'content',
      (v): Result.Result<string, ReadTextFileError> =>
        readTextFile({ filePath: v.manifestPath })
    ),
    Result.bind(
      'manifest',
      (v): Result.Result<Manifest, ParseManifestError> =>
        parseManifest({
          content: v.content,
          manifestPath: v.manifestPath
        })
    ),
    Result.andThrough(v =>
      validateManifest({
        ignoredRelativePaths: v.ignoredRelativePaths,
        manifest: v.manifest,
        sourceDirectory: v.sourceDirectory
      })
    ),
    Result.map((v): Manifest => v.manifest)
  );
}
