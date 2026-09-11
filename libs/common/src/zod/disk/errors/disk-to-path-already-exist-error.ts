import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskToPathAlreadyExistError = {
  code: 'DISK_TO_PATH_ALREADY_EXIST';
};

export let zDiskToPathAlreadyExistError = z.object({
  code: z.literal('DISK_TO_PATH_ALREADY_EXIST')
});

assertTypesEqual<
  DiskToPathAlreadyExistError,
  z.infer<typeof zDiskToPathAlreadyExistError>
>({ value: true });
