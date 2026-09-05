import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import { zDiskSyncFile } from '#common/zod/disk/disk-sync-file';
import {
  type ToDiskSyncRepoBaseResponsePayload,
  zToDiskSyncRepoBaseResponsePayload
} from './sync-repo-base-response-payload';

export type ToDiskSyncRepoFromServerResponsePayload = Extend<
  ToDiskSyncRepoBaseResponsePayload,
  {
    direction: 'from-server';
    changedFiles: DiskSyncFile[];
    deletedFiles: DiskSyncFile[];
  }
>;

export let zToDiskSyncRepoFromServerResponsePayload =
  zToDiskSyncRepoBaseResponsePayload.extend({
    direction: z.literal('from-server'),
    changedFiles: z.array(zDiskSyncFile),
    deletedFiles: z.array(zDiskSyncFile)
  });

assertTypesEqual<
  ToDiskSyncRepoFromServerResponsePayload,
  z.infer<typeof zToDiskSyncRepoFromServerResponsePayload>
>({ value: true });
