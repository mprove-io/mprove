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
  return Result.pipe(
    Result.succeed(item),
    Result.bind('content', v => readTextFile({ filePath: v.manifestPath })),
    Result.bind('manifest', v =>
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
    Result.map(v => v.manifest)
  );
}
