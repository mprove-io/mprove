import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskBranchIsNotExistError,
  zDiskBranchIsNotExistError
} from '#common/zod/disk/errors/disk-branch-is-not-exist-error';
import {
  type DiskCheckoutBranchError,
  zDiskCheckoutBranchError
} from '#common/zod/disk/function-errors/disk-checkout-branch-error';

export type DiskCheckoutRequestedBranchError =
  | DiskBranchIsNotExistError
  | DiskCheckoutBranchError;

export let zDiskCheckoutRequestedBranchError = z.union([
  zDiskBranchIsNotExistError,
  zDiskCheckoutBranchError
]);

assertTypesEqual<
  DiskCheckoutRequestedBranchError,
  z.infer<typeof zDiskCheckoutRequestedBranchError>
>({ value: true });
