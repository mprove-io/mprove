import { type Stats, statSync } from 'node:fs';
import { Result } from '@praha/byethrow';
import type { ComposerContentDirectoryAccessFailedError } from '../../../types/errors/composer-content-directory-access-failed-error';
import type { GetContentStatsError } from '../../../types/function-errors/get-content-stats-error';

export function getContentStats(item: {
  contentDirectory: string;
}): Result.Result<Stats, GetContentStatsError> {
  let result: Result.Result<Stats, GetContentStatsError> = Result.try({
    try: (): Stats => statSync(item.contentDirectory),
    catch: (error: unknown): ComposerContentDirectoryAccessFailedError => ({
      code: 'COMPOSER_CONTENT_DIRECTORY_ACCESS_FAILED',
      message: `Unable to access ${item.contentDirectory}`,
      path: item.contentDirectory,
      originalError: error
    })
  });

  return result;
}
