import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskFolderIsNotExistError = {
  code: 'DISK_FOLDER_IS_NOT_EXIST';
};

export let zDiskFolderIsNotExistError = z.object({
  code: z.literal('DISK_FOLDER_IS_NOT_EXIST')
});

assertTypesEqual<
  DiskFolderIsNotExistError,
  z.infer<typeof zDiskFolderIsNotExistError>
>({ value: true });
