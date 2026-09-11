import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskDefaultBranchCannotBeDeletedError = {
  code: 'DISK_DEFAULT_BRANCH_CANNOT_BE_DELETED';
};

export let zDiskDefaultBranchCannotBeDeletedError = z.object({
  code: z.literal('DISK_DEFAULT_BRANCH_CANNOT_BE_DELETED')
});

assertTypesEqual<
  DiskDefaultBranchCannotBeDeletedError,
  z.infer<typeof zDiskDefaultBranchCannotBeDeletedError>
>({ value: true });
