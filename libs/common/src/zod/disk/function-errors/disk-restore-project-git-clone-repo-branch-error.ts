import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCheckoutBranchError,
  zDiskCheckoutBranchError
} from '#common/zod/disk/function-errors/disk-checkout-branch-error';

export type DiskRestoreProjectGitCloneRepoBranchError = DiskCheckoutBranchError;

export let zDiskRestoreProjectGitCloneRepoBranchError =
  zDiskCheckoutBranchError;

assertTypesEqual<
  DiskRestoreProjectGitCloneRepoBranchError,
  z.infer<typeof zDiskRestoreProjectGitCloneRepoBranchError>
>({ value: true });
