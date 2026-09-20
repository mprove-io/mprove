import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCreateInitialCommitToProdError,
  zDiskCreateInitialCommitToProdError
} from '#common/zod/disk/function-errors/disk-create-initial-commit-to-prod-error';
import {
  type DiskPushToRemoteError,
  zDiskPushToRemoteError
} from '#common/zod/disk/function-errors/disk-push-to-remote-error';

export type DiskInitializeAndPushManagedProdError =
  | DiskCreateInitialCommitToProdError
  | DiskPushToRemoteError;

export let zDiskInitializeAndPushManagedProdError = z.union([
  zDiskCreateInitialCommitToProdError,
  zDiskPushToRemoteError
]);

assertTypesEqual<
  DiskInitializeAndPushManagedProdError,
  z.infer<typeof zDiskInitializeAndPushManagedProdError>
>({ value: true });
