import { Result } from '@praha/byethrow';
import { ServerError } from '#common/models/server-error';
import type { DiskItemCatalog } from '#common/zod/disk/disk-item-catalog';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';
import { getNodesAndFiles } from './get-nodes-and-files';

// Temporary bridge for anticipated errors thrown by legacy helpers.
export function getNodesAndFilesWrapped(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  readFiles: boolean;
  isRootMproveDir: boolean;
}): Result.ResultAsync<
  DiskItemCatalog,
  FileIsSymlinkError | FileSizeIsTooBigError
> {
  let { projectId, projectDir, repoId, readFiles, isRootMproveDir } = item;

  let result = Result.pipe(
    Result.try({
      try: (): Result.ResultAsync<DiskItemCatalog, never> => {
        return getNodesAndFiles({
          projectId: projectId,
          projectDir: projectDir,
          repoId: repoId,
          readFiles: readFiles,
          isRootMproveDir: isRootMproveDir
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
