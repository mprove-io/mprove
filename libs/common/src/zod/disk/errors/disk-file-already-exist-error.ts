import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskFileAlreadyExistError = {
  code: 'DISK_FILE_ALREADY_EXIST';
};

export let zDiskFileAlreadyExistError = z.object({
  code: z.literal('DISK_FILE_ALREADY_EXIST')
});

assertTypesEqual<
  DiskFileAlreadyExistError,
  z.infer<typeof zDiskFileAlreadyExistError>
>({ value: true });
