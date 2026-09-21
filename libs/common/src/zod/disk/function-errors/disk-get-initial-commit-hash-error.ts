import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCheckoutBranchError,
  zDiskCheckoutBranchError
} from '#common/zod/disk/function-errors/disk-checkout-branch-error';

export type DiskGetInitialCommitHashError = DiskCheckoutBranchError;

export let zDiskGetInitialCommitHashError = zDiskCheckoutBranchError;

assertTypesEqual<
  DiskGetInitialCommitHashError,
  z.infer<typeof zDiskGetInitialCommitHashError>
>({ value: true });
