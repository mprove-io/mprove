import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskBranchIsNotExistError,
  zDiskBranchIsNotExistError
} from '#common/types/disk/errors/disk-branch-is-not-exist-error';
import {
  type DiskCheckoutBranchError,
  zDiskCheckoutBranchError
} from '#common/types/disk/function-errors/disk-checkout-branch-error';

export type DiskGetIsFetchedAfterCheckoutRequestedBranchError =
  | DiskBranchIsNotExistError
  | DiskCheckoutBranchError;

export let zDiskGetIsFetchedAfterCheckoutRequestedBranchError = z.union([
  zDiskBranchIsNotExistError,
  zDiskCheckoutBranchError
]);

assertTypesEqual<
  DiskGetIsFetchedAfterCheckoutRequestedBranchError,
  z.infer<typeof zDiskGetIsFetchedAfterCheckoutRequestedBranchError>
>({ value: true });
