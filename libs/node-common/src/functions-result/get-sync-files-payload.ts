import { Result } from '@praha/byethrow';
import pIteration from 'p-iteration';
import type { StatusResult } from 'simple-git';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { FileStatus } from '#common/zod/disk/file-status';
import type { FileWithGitFileStatus } from '#common/zod/disk/file-with-git-file-status';
import type { FileIsSymlinkError } from '#common/zod/node-common/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/node-common/errors/file-size-is-too-big-error';
import { readFileCheckSize } from './read-file-check-size';

const { forEachSeries } = pIteration;

type SyncFilesPayload = {
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
};

export function getSyncFilesPayload(item: {
  statusResult: StatusResult;
  repoDir: string;
}): Result.ResultAsync<
  SyncFilesPayload,
  FileIsSymlinkError | FileSizeIsTooBigError
> {
  let { statusResult, repoDir } = item;

  return Result.try({
    try: async (): Promise<SyncFilesPayload> => {
      let changedFiles: DiskSyncFile[] = [];
      let deletedFiles: DiskSyncFile[] = [];

      let allFiles: FileWithGitFileStatus[] = [
        ...statusResult.not_added.map(path => ({
          path: path,
          gitFileStatus: 'not_added' as const
        })),
        ...statusResult.created.map(path => ({
          path: path,
          gitFileStatus: 'created' as const
        })),
        ...statusResult.deleted.map(path => ({
          path: path,
          gitFileStatus: 'deleted' as const
        })),
        ...statusResult.modified.map(path => ({
          path: path,
          gitFileStatus: 'modified' as const
        })),
        ...statusResult.renamed.flatMap(renamed => [
          { path: renamed.from, gitFileStatus: 'deleted' as const },
          { path: renamed.to, gitFileStatus: 'created' as const }
        ]),
        ...statusResult.conflicted.map(path => ({
          path: path,
          gitFileStatus: 'conflicted' as const
        }))
      ];

      let uniquePaths = new Set<string>();
      let files: FileWithGitFileStatus[] = [];

      allFiles.forEach(file => {
        if (uniquePaths.has(file.path) === false) {
          uniquePaths.add(file.path);
          files.push(file);
        }
      });
      files.sort((a, b) => a.path.localeCompare(b.path));

      await forEachSeries(
        files,
        async (fileWithStatus: FileWithGitFileStatus) => {
          let filePath: string = fileWithStatus.path;

          let status: FileStatus =
            fileWithStatus.gitFileStatus === 'not_added' ||
            fileWithStatus.gitFileStatus === 'created'
              ? 'New'
              : fileWithStatus.gitFileStatus === 'deleted'
                ? 'Deleted'
                : fileWithStatus.gitFileStatus === 'modified'
                  ? 'Modified'
                  : fileWithStatus.gitFileStatus === 'conflicted'
                    ? 'Conflicted'
                    : undefined;

          let content: string;

          if (status !== 'Deleted') {
            let fullPath: string = `${repoDir}/${filePath}`;

            let file = await Result.unwrap(
              readFileCheckSize({
                filePath: fullPath,
                getStat: false
              })
            );

            content = file.content;
          }

          let file: DiskSyncFile = {
            path: filePath,
            status: status,
            content: content
          };

          if (file.status === 'Deleted') {
            deletedFiles.push(file);
          } else {
            changedFiles.push(file);
          }
        }
      );

      return {
        changedFiles: changedFiles,
        deletedFiles: deletedFiles
      };
    },
    catch: (error: unknown): FileIsSymlinkError | FileSizeIsTooBigError => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error.code === 'FILE_IS_SYMLINK' ||
          error.code === 'FILE_SIZE_IS_TOO_BIG')
      ) {
        return error as FileIsSymlinkError | FileSizeIsTooBigError;
      }

      throw error;
    }
  });
}
