import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskTheirBranchIsNotExistError = {
  code: 'DISK_THEIR_BRANCH_IS_NOT_EXIST';
};

export let zDiskTheirBranchIsNotExistError = z.object({
  code: z.literal('DISK_THEIR_BRANCH_IS_NOT_EXIST')
});

assertTypesEqual<
  DiskTheirBranchIsNotExistError,
  z.infer<typeof zDiskTheirBranchIsNotExistError>
>({ value: true });
