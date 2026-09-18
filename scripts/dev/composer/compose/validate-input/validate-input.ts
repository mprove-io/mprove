import type { Stats } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposeInput } from '../../types/compose-input';
import type { GetContentStatsError } from '../../types/function-errors/get-content-stats-error';
import type { ValidateInputError } from '../../types/function-errors/validate-input-error';
import { getContentStats } from './get-content-stats/get-content-stats';
import { resolveInput } from './resolve-input/resolve-input';
import { validateArgumentCount } from './validate-argument-count/validate-argument-count';
import { validateContentPathIsDirectory } from './validate-content-path-is-directory/validate-content-path-is-directory';
import { validateManifestOutputPathConflict } from './validate-manifest-output-path-conflict/validate-manifest-output-path-conflict';
import { validateManifestPathOutsideContentDirectory } from './validate-manifest-path-outside-content-directory/validate-manifest-path-outside-content-directory';
import { validateOutputPathOutsideContentDirectory } from './validate-output-path-outside-content-directory/validate-output-path-outside-content-directory';

export function validateInput(item: {
  argv: string[];
}): Result.Result<ComposeInput, ValidateInputError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v => validateArgumentCount({ argv: v.argv })),
    Result.andThen(
      (v): Result.Result<ComposeInput, never> => resolveInput({ argv: v.argv })
    ),
    Result.andThrough(v =>
      validateManifestOutputPathConflict({
        manifestPath: v.manifestPath,
        outputPath: v.outputPath
      })
    ),
    Result.andThrough(v =>
      validateManifestPathOutsideContentDirectory({
        contentDirectory: v.contentDirectory,
        manifestPath: v.manifestPath
      })
    ),
    Result.andThrough(v =>
      validateOutputPathOutsideContentDirectory({
        contentDirectory: v.contentDirectory,
        outputPath: v.outputPath
      })
    ),
    Result.bind(
      'contentStats',
      (v): Result.Result<Stats, GetContentStatsError> =>
        getContentStats({ contentDirectory: v.contentDirectory })
    ),
    Result.andThrough(v =>
      validateContentPathIsDirectory({
        contentDirectory: v.contentDirectory,
        contentStats: v.contentStats
      })
    ),
    Result.map(
      (v): ComposeInput => ({
        contentDirectory: v.contentDirectory,
        manifestPath: v.manifestPath,
        outputPath: v.outputPath
      })
    )
  );
}
