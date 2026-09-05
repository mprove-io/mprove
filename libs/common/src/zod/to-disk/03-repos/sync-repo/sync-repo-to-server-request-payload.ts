import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import { zDiskSyncFile } from '#common/zod/disk/disk-sync-file';
import {
  type ToDiskSyncRepoBaseRequestPayload,
  zToDiskSyncRepoBaseRequestPayload
} from './sync-repo-base-request-payload';

export type ToDiskSyncRepoToServerRequestPayload = Extend<
  ToDiskSyncRepoBaseRequestPayload,
  {
    direction: 'to-server';
    changedFiles: DiskSyncFile[];
    deletedFiles: DiskSyncFile[];
  }
>;

export let zToDiskSyncRepoToServerRequestPayload =
  zToDiskSyncRepoBaseRequestPayload.extend({
    direction: z.literal('to-server'),
    changedFiles: z.array(zDiskSyncFile),
    deletedFiles: z.array(zDiskSyncFile)
  });

assertTypesEqual<
  ToDiskSyncRepoToServerRequestPayload,
  z.infer<typeof zToDiskSyncRepoToServerRequestPayload>
>({ value: true });
