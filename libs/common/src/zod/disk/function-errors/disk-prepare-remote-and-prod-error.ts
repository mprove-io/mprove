import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskInitializeAndPushManagedProdError,
  zDiskInitializeAndPushManagedProdError
} from '#common/zod/disk/function-errors/disk-initialize-and-push-managed-prod-error';

export type DiskPrepareRemoteAndProdError =
  DiskInitializeAndPushManagedProdError;

export let zDiskPrepareRemoteAndProdError =
  zDiskInitializeAndPushManagedProdError;

assertTypesEqual<
  DiskPrepareRemoteAndProdError,
  z.infer<typeof zDiskPrepareRemoteAndProdError>
>({ value: true });
