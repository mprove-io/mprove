import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskFileIsNotExistError = {
  code: 'DISK_FILE_IS_NOT_EXIST';
};

export let zDiskFileIsNotExistError = z.object({
  code: z.literal('DISK_FILE_IS_NOT_EXIST')
});

assertTypesEqual<
  DiskFileIsNotExistError,
  z.infer<typeof zDiskFileIsNotExistError>
>({ value: true });
