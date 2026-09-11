import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskBranchIsNotExistError = {
  code: 'DISK_BRANCH_IS_NOT_EXIST';
};

export let zDiskBranchIsNotExistError = z.object({
  code: z.literal('DISK_BRANCH_IS_NOT_EXIST')
});

assertTypesEqual<
  DiskBranchIsNotExistError,
  z.infer<typeof zDiskBranchIsNotExistError>
>({ value: true });
