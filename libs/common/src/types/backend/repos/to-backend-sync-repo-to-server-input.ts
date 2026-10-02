import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSyncRepoBaseInput,
  zToBackendSyncRepoBaseInput
} from '#common/types/backend/repos/to-backend-sync-repo-base-input';
import {
  type DiskSyncFile,
  zDiskSyncFile
} from '#common/types/disk/disk-sync-file';
import type { Extend } from '#common/types/extend';

export type ToBackendSyncRepoToServerInput = Extend<
  ToBackendSyncRepoBaseInput,
  {
    direction: 'to-server';
    changedFiles: DiskSyncFile[];
    deletedFiles: DiskSyncFile[];
  }
>;

export let zToBackendSyncRepoToServerInput = zToBackendSyncRepoBaseInput.extend(
  {
    direction: z.literal('to-server'),
    changedFiles: z.array(zDiskSyncFile),
    deletedFiles: z.array(zDiskSyncFile)
  }
);

assertTypesEqual<
  ToBackendSyncRepoToServerInput,
  z.infer<typeof zToBackendSyncRepoToServerInput>
>({ value: true });
