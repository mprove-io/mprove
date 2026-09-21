import { Result } from '@praha/byethrow';
import type { StatusResult } from 'simple-git';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { DiskGetSyncDataError } from '#common/zod/disk/function-errors/disk-get-sync-data-error';
import type { GetSyncFilesPayloadError } from '#common/zod/node-common/function-errors/get-sync-files-payload-error';
import { getSyncFilesPayload } from '#node-common/functions-result/get-sync-files-payload';
import { getToServerSyncData } from './get-to-server-sync-data/get-to-server-sync-data';

type SyncFilesPayload = {
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
};

export type SyncData =
  | {
      direction: 'from-server';
      changedFiles: DiskSyncFile[];
      deletedFiles: DiskSyncFile[];
    }
  | {
      direction: 'to-server';
      appliedChangesOnServer: string[];
    };

export function getSyncData(item: {
  direction: 'from-server' | 'to-server';
  repoDir: string;
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
  statusResult: StatusResult;
}): Result.ResultAsync<SyncData, DiskGetSyncDataError> {
  if (item.direction === 'to-server') {
    return getToServerSyncData(item);
  }

  return Result.pipe(
    Result.succeed(item),
    Result.andThen(
      (v): Result.ResultAsync<SyncFilesPayload, GetSyncFilesPayloadError> =>
        getSyncFilesPayload({
          repoDir: v.repoDir,
          statusResult: v.statusResult
        })
    ),
    Result.map(
      (v): SyncData => ({
        direction: 'from-server',
        changedFiles: v.changedFiles,
        deletedFiles: v.deletedFiles
      })
    )
  );
}
