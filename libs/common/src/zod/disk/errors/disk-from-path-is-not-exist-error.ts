import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskFromPathIsNotExistError = {
  code: 'DISK_FROM_PATH_IS_NOT_EXIST';
};

export let zDiskFromPathIsNotExistError = z.object({
  code: z.literal('DISK_FROM_PATH_IS_NOT_EXIST')
});

assertTypesEqual<
  DiskFromPathIsNotExistError,
  z.infer<typeof zDiskFromPathIsNotExistError>
>({ value: true });
