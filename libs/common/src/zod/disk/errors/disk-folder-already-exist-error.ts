import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskFolderAlreadyExistError = {
  code: 'DISK_FOLDER_ALREADY_EXIST';
};

export let zDiskFolderAlreadyExistError = z.object({
  code: z.literal('DISK_FOLDER_ALREADY_EXIST')
});

assertTypesEqual<
  DiskFolderAlreadyExistError,
  z.infer<typeof zDiskFolderAlreadyExistError>
>({ value: true });
