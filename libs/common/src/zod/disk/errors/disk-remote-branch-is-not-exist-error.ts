import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskRemoteBranchIsNotExistError = {
  code: 'DISK_REMOTE_BRANCH_IS_NOT_EXIST';
};

export let zDiskRemoteBranchIsNotExistError = z.object({
  code: z.literal('DISK_REMOTE_BRANCH_IS_NOT_EXIST')
});

assertTypesEqual<
  DiskRemoteBranchIsNotExistError,
  z.infer<typeof zDiskRemoteBranchIsNotExistError>
>({ value: true });
