import type { Stats } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposeInput } from '../../types/compose-input';
import type { GetContentStatsError } from '../../types/function-errors/get-content-stats-error';
import type { GetMissingDirectorySectionFilePathsError } from '../../types/function-errors/get-missing-directory-section-file-paths-error';
import type { ValidateInputError } from '../../types/function-errors/validate-input-error';
import { getContentStats } from './get-content-stats/get-content-stats';
import { getMissingDirectorySectionFilePaths } from './get-missing-directory-section-file-paths/get-missing-directory-section-file-paths';
import { resolveInput } from './resolve-input/resolve-input';
import { validateArgumentCount } from './validate-argument-count/validate-argument-count';
import { validateContentPathIsDirectory } from './validate-content-path-is-directory/validate-content-path-is-directory';
import { validateDirectorySectionFilesExist } from './validate-directory-section-files-exist/validate-directory-section-files-exist';
import { validateManifestOutputPathConflict } from './validate-manifest-output-path-conflict/validate-manifest-output-path-conflict';
import { validateManifestPathOutsideContentDirectory } from './validate-manifest-path-outside-content-directory/validate-manifest-path-outside-content-directory';
import { validateOutputPathOutsideContentDirectory } from './validate-output-path-outside-content-directory/validate-output-path-outside-content-directory';

export function validateInput(item: {
  argv: string[];
}): Result.Result<ComposeInput, ValidateInputError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v => validateArgumentCount({ argv: v.argv })),
    Result.map((v): ComposeInput => resolveInput({ argv: v.argv })),
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
    Result.bind(
      'missingSectionFilePaths',
      (v): Result.Result<string[], GetMissingDirectorySectionFilePathsError> =>
        getMissingDirectorySectionFilePaths({
          contentDirectory: v.contentDirectory
        })
    ),
    Result.andThrough(v =>
      validateDirectorySectionFilesExist({
        missingSectionFilePaths: v.missingSectionFilePaths
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
