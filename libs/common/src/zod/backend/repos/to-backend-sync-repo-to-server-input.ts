import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendSyncRepoBaseInput,
  zToBackendSyncRepoBaseInput
} from '#common/zod/backend/repos/to-backend-sync-repo-base-input';
import {
  type DiskSyncFile,
  zDiskSyncFile
} from '#common/zod/disk/disk-sync-file';

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
