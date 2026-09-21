import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type ApplySyncPayloadError,
  zApplySyncPayloadError
} from '#common/zod/node-common/function-errors/apply-sync-payload-error';
import {
  type GetSyncAppliedChangesError,
  zGetSyncAppliedChangesError
} from '#common/zod/node-common/function-errors/get-sync-applied-changes-error';
import {
  type ResetWorkingTreeToHeadError,
  zResetWorkingTreeToHeadError
} from '#common/zod/node-common/function-errors/reset-working-tree-to-head-error';

export type DiskGetToServerSyncDataError =
  | GetSyncAppliedChangesError
  | ResetWorkingTreeToHeadError
  | ApplySyncPayloadError;

export let zDiskGetToServerSyncDataError = z.union([
  zGetSyncAppliedChangesError,
  zResetWorkingTreeToHeadError,
  zApplySyncPayloadError
]);

assertTypesEqual<
  DiskGetToServerSyncDataError,
  z.infer<typeof zDiskGetToServerSyncDataError>
>({ value: true });
