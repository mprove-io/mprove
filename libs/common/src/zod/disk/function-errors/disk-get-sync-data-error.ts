import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskGetToServerSyncDataError,
  zDiskGetToServerSyncDataError
} from '#common/zod/disk/function-errors/disk-get-to-server-sync-data-error';
import {
  type GetSyncFilesPayloadError,
  zGetSyncFilesPayloadError
} from '#common/zod/node-common/function-errors/get-sync-files-payload-error';

export type DiskGetSyncDataError =
  | DiskGetToServerSyncDataError
  | GetSyncFilesPayloadError;

export let zDiskGetSyncDataError = z.union([
  zDiskGetToServerSyncDataError,
  zGetSyncFilesPayloadError
]);

assertTypesEqual<DiskGetSyncDataError, z.infer<typeof zDiskGetSyncDataError>>({
  value: true
});
