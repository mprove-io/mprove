import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskRepoIsNotCleanForCheckoutBranchError,
  zDiskRepoIsNotCleanForCheckoutBranchError
} from '#common/zod/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import {
  type DiskGetRepoStatusError,
  zDiskGetRepoStatusError
} from '#common/zod/disk/function-errors/disk-get-repo-status-error';

export type DiskCheckoutBranchError =
  | DiskRepoIsNotCleanForCheckoutBranchError
  | DiskGetRepoStatusError;

export let zDiskCheckoutBranchError = z.union([
  zDiskRepoIsNotCleanForCheckoutBranchError,
  zDiskGetRepoStatusError
]);

assertTypesEqual<
  DiskCheckoutBranchError,
  z.infer<typeof zDiskCheckoutBranchError>
>({
  value: true
});
