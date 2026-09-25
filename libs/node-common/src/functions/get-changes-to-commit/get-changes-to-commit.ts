import { Result } from '@praha/byethrow';
import pIteration from 'p-iteration';
import type { StatusResult } from 'simple-git';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { FileStatus } from '#common/zod/disk/file-status';
import type { FileWithGitFileStatus } from '#common/zod/disk/file-with-git-file-status';
import type { FileIsSymlinkError } from '#common/zod/node-common/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/node-common/errors/file-size-is-too-big-error';
import type { GetChangesToCommitError } from '#common/zod/node-common/function-errors/get-changes-to-commit-error';
import { createSimpleGit } from '#node-common/functions/create-simple-git/create-simple-git';
import { readFileCheckSize } from '#node-common/functions/read-file-check-size/read-file-check-size';

const { forEachSeries } = pIteration;

export function getChangesToCommit(item: {
  repoDir: string;
  addContent?: boolean;
  expandRenamed?: boolean;
}): Result.ResultAsync<DiskFileChange[], GetChangesToCommitError> {
  let { repoDir, addContent, expandRenamed } = item;

  return Result.try({
    try: async (): Promise<DiskFileChange[]> => {
      let git = createSimpleGit({ baseDir: repoDir });

      let statusResult: StatusResult = await git.status();

      let changesToCommit: DiskFileChange[] = [];

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
        ...(expandRenamed === true
          ? statusResult.renamed.flatMap(renamed => [
              { path: renamed.from, gitFileStatus: 'deleted' as const },
              { path: renamed.to, gitFileStatus: 'created' as const }
            ])
          : statusResult.renamed.map(renamed => ({
              path: renamed.to,
              gitFileStatus: 'renamed' as const
            }))),
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

      await forEachSeries(files, async (file: FileWithGitFileStatus) => {
        let path: string = file.path;
        let pathArray: string[] = path.split('/');

        let fileId: string = encodeFilePath({ filePath: path });

        let fileName: string = pathArray.slice(-1)[0];

        let parentPath: string =
          pathArray.length === 1 ? '' : pathArray.slice(0, -1).join('/');

        let status: FileStatus =
          file.gitFileStatus === 'not_added' || file.gitFileStatus === 'created'
            ? 'New'
            : file.gitFileStatus === 'deleted'
              ? 'Deleted'
              : file.gitFileStatus === 'modified'
                ? 'Modified'
                : file.gitFileStatus === 'conflicted'
                  ? 'Conflicted'
                  : file.gitFileStatus === 'renamed'
                    ? 'Renamed'
                    : undefined;

        let fileContent: string;

        if (addContent === true && status !== 'Deleted') {
          let fullPath: string = `${repoDir}/${path}`;

          let { content } = await Result.unwrap(
            readFileCheckSize({
              filePath: fullPath,
              getStat: true
            })
          );

          fileContent = content;
        }

        let change: DiskFileChange = {
          fileName: fileName,
          fileId: fileId,
          parentPath: parentPath,
          status: status,
          content: fileContent
        };

        if (isUndefined(change.content)) {
          delete change.content;
        }

        changesToCommit.push(change);
      });

      return changesToCommit;
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
