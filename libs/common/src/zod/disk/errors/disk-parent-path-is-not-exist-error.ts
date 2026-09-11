import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskParentPathIsNotExistError = {
  code: 'DISK_PARENT_PATH_IS_NOT_EXIST';
};

export let zDiskParentPathIsNotExistError = z.object({
  code: z.literal('DISK_PARENT_PATH_IS_NOT_EXIST')
});

assertTypesEqual<
  DiskParentPathIsNotExistError,
  z.infer<typeof zDiskParentPathIsNotExistError>
>({ value: true });
