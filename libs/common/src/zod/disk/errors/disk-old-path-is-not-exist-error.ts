import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskOldPathIsNotExistError = {
  code: 'DISK_OLD_PATH_IS_NOT_EXIST';
};

export let zDiskOldPathIsNotExistError = z.object({
  code: z.literal('DISK_OLD_PATH_IS_NOT_EXIST')
});

assertTypesEqual<
  DiskOldPathIsNotExistError,
  z.infer<typeof zDiskOldPathIsNotExistError>
>({ value: true });
