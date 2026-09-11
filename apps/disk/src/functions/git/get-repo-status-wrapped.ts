import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { ServerError } from '#common/models/server-error';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';
import { getRepoStatus } from './get-repo-status';

// Temporary bridge for anticipated errors thrown by legacy helpers.
export function getRepoStatusWrapped(item: {
  projectId: string;
  repoId: string;
  projectDir: string;
  repoDir: string;
  git: SimpleGit;
  isFetch: boolean;
  isCheckConflicts: boolean;
  addContent?: boolean;
  expandRenamed?: boolean;
}): Result.ResultAsync<
  DiskItemStatus,
  FileIsSymlinkError | FileSizeIsTooBigError
> {
  let {
    projectId,
    repoId,
    projectDir,
    repoDir,
    git,
    isFetch,
    isCheckConflicts,
    addContent,
    expandRenamed
  } = item;

  let result = Result.pipe(
    Result.try({
      try: (): Result.ResultAsync<DiskItemStatus, never> => {
        return getRepoStatus({
          projectId: projectId,
          repoId: repoId,
          projectDir: projectDir,
          repoDir: repoDir,
          git: git,
          isFetch: isFetch,
          isCheckConflicts: isCheckConflicts,
          addContent: addContent,
          expandRenamed: expandRenamed
        });
      },
      catch: (error: unknown): FileIsSymlinkError | FileSizeIsTooBigError => {
        if (error instanceof ServerError) {
          if (error.message === 'FILE_IS_SYMLINK') {
            return { code: 'FILE_IS_SYMLINK' };
          }

          if (error.message === 'FILE_SIZE_IS_TOO_BIG') {
            return { code: 'FILE_SIZE_IS_TOO_BIG' };
          }
        }

        throw error;
      }
    }),
    Result.andThen(result => result)
  );

  return result;
}
