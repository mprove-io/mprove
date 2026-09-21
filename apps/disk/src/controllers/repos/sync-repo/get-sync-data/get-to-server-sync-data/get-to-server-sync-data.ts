import { Result } from '@praha/byethrow';
import type { StatusResult } from 'simple-git';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { DiskGetToServerSyncDataError } from '#common/zod/disk/function-errors/disk-get-to-server-sync-data-error';
import type { GetSyncAppliedChangesError } from '#common/zod/node-common/function-errors/get-sync-applied-changes-error';
import { addChangesToStage } from '#disk/functions/git/add-changes-to-stage/add-changes-to-stage';
import { applySyncPayload } from '#node-common/functions-result/apply-sync-payload';
import { getSyncAppliedChanges } from '#node-common/functions-result/get-sync-applied-changes';
import { resetWorkingTreeToHead } from '#node-common/functions-result/reset-working-tree-to-head';
import type { SyncData } from '../get-sync-data';

export function getToServerSyncData(item: {
  repoDir: string;
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
  statusResult: StatusResult;
}): Result.ResultAsync<SyncData, DiskGetToServerSyncDataError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'appliedChangesOnServer',
      (v): Result.ResultAsync<string[], GetSyncAppliedChangesError> =>
        getSyncAppliedChanges({
          repoDir: v.repoDir,
          changedFiles: v.changedFiles,
          deletedFiles: v.deletedFiles,
          statusResult: v.statusResult
        })
    ),
    Result.andThrough(v =>
      resetWorkingTreeToHead({
        repoDir: v.repoDir,
        statusResult: v.statusResult
      })
    ),
    Result.andThrough(v =>
      applySyncPayload({
        repoDir: v.repoDir,
        changedFiles: v.changedFiles,
        deletedFiles: v.deletedFiles
      })
    ),
    Result.andThrough(v => addChangesToStage({ repoDir: v.repoDir })),
    Result.map(
      (v): SyncData => ({
        direction: 'to-server',
        appliedChangesOnServer: v.appliedChangesOnServer
      })
    )
  );
}
