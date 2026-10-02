import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSyncRepoBaseOutput,
  zToBackendSyncRepoBaseOutput
} from '#common/types/backend/repos/to-backend-sync-repo-base-output';
import {
  type DiskSyncFile,
  zDiskSyncFile
} from '#common/types/disk/disk-sync-file';
import type { Extend } from '#common/types/extend';

export type ToBackendSyncRepoFromServerOutput = Extend<
  ToBackendSyncRepoBaseOutput,
  {
    direction: 'from-server';
    changedFiles: DiskSyncFile[];
    deletedFiles: DiskSyncFile[];
  }
>;

export let zToBackendSyncRepoFromServerOutput =
  zToBackendSyncRepoBaseOutput.extend({
    direction: z.literal('from-server'),
    changedFiles: z.array(zDiskSyncFile),
    deletedFiles: z.array(zDiskSyncFile)
  });

assertTypesEqual<
  ToBackendSyncRepoFromServerOutput,
  z.infer<typeof zToBackendSyncRepoFromServerOutput>
>({ value: true });
