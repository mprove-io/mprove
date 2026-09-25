import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskRepoStatusIsNotNeedPushError,
  zDiskRepoStatusIsNotNeedPushError
} from '#common/zod/disk/errors/disk-repo-status-is-not-need-push-error';
import {
  type DiskGetRepoStatusError,
  zDiskGetRepoStatusError
} from '#common/zod/disk/function-errors/disk-get-repo-status-error';

export type DiskPushToRemoteError =
  | DiskRepoStatusIsNotNeedPushError
  | DiskGetRepoStatusError;

export let zDiskPushToRemoteError = z.union([
  zDiskRepoStatusIsNotNeedPushError,
  zDiskGetRepoStatusError
]);

assertTypesEqual<DiskPushToRemoteError, z.infer<typeof zDiskPushToRemoteError>>(
  {
    value: true
  }
);
