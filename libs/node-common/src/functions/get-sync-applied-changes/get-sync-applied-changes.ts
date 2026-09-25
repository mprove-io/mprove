import path from 'node:path';
import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import pIteration from 'p-iteration';
import type { StatusResult } from 'simple-git';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import type { FileIsSymlinkError } from '#common/zod/node-common/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/node-common/errors/file-size-is-too-big-error';
import type { GetSyncAppliedChangesError } from '#common/zod/node-common/function-errors/get-sync-applied-changes-error';
import {
  type DestinationChange,
  getDestinationOnlyChanges
} from '#node-common/functions/get-sync-applied-changes/get-destination-only-changes/get-destination-only-changes';
import { readFileCheckSize } from '#node-common/functions/read-file-check-size/read-file-check-size';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir/validate-path-under-dir';

const { forEachSeries } = pIteration;

let statusOrder = {
  deleted: 1,
  modified: 2,
  new: 3
};

export function getSyncAppliedChanges(item: {
  repoDir: string;
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
  statusResult: StatusResult;
}): Result.ResultAsync<string[], GetSyncAppliedChangesError> {
  let { repoDir, changedFiles, deletedFiles, statusResult } = item;

  return Result.try({
    try: async (): Promise<string[]> => {
      let changes: DestinationChange[] = [];

      let payloadPaths = new Set<string>([
        ...changedFiles.map(file => file.path),
        ...deletedFiles.map(file => file.path)
      ]);

      await forEachSeries(deletedFiles, async (deletedFile: DiskSyncFile) => {
        let filePath: string = Result.unwrap(
          validatePathUnderDir({
            fullPath: path.resolve(repoDir, deletedFile.path),
            allowedDir: repoDir,
            displayPath: deletedFile.path
          })
        );

        let pathExists: boolean = await fse.pathExists(filePath);

        if (pathExists === true) {
          changes.push({
            status: 'deleted',
            path: deletedFile.path
          });
        }
      });

      await forEachSeries(changedFiles, async (changedFile: DiskSyncFile) => {
        let filePath: string = Result.unwrap(
          validatePathUnderDir({
            fullPath: path.resolve(repoDir, changedFile.path),
            allowedDir: repoDir,
            displayPath: changedFile.path
          })
        );

        let stat: fse.Stats;

        try {
          stat = await fse.lstat(filePath);
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }

        if (stat === undefined) {
          changes.push({
            status: 'new',
            path: changedFile.path
          });
          return;
        }

        if (stat.isFile() === false) {
          changes.push({
            status: 'modified',
            path: changedFile.path
          });
          return;
        }

        let filePayload = await Result.unwrap(
          readFileCheckSize({
            filePath: filePath,
            getStat: false
          })
        );

        if (filePayload.content !== changedFile.content) {
          changes.push({
            status: 'modified',
            path: changedFile.path
          });
        }
      });

      let destinationOnlyChanges = getDestinationOnlyChanges({
        statusResult: statusResult,
        payloadPaths: payloadPaths
      });

      destinationOnlyChanges.forEach(change => {
        changes.push(change);
      });

      let uniqueChanges = new Map<string, DestinationChange>();

      changes.forEach(change => {
        uniqueChanges.set(`${change.status}:${change.path}`, change);
      });

      let sortedChanges = [...uniqueChanges.values()];

      sortedChanges.sort((a, b) => {
        let statusDiff: number = statusOrder[a.status] - statusOrder[b.status];

        if (statusDiff !== 0) {
          return statusDiff;
        }

        return a.path.localeCompare(b.path);
      });

      return sortedChanges.map(change => `(${change.status}) ${change.path}`);
    },
    catch: (
      error: unknown
    ): DiskPathTraversalError | FileIsSymlinkError | FileSizeIsTooBigError => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error.code === 'DISK_PATH_TRAVERSAL' ||
          error.code === 'FILE_IS_SYMLINK' ||
          error.code === 'FILE_SIZE_IS_TOO_BIG')
      ) {
        return error as
          | DiskPathTraversalError
          | FileIsSymlinkError
          | FileSizeIsTooBigError;
      }

      throw error;
    }
  });
}
