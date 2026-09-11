import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskNewPathAlreadyExistError = {
  code: 'DISK_NEW_PATH_ALREADY_EXIST';
};

export let zDiskNewPathAlreadyExistError = z.object({
  code: z.literal('DISK_NEW_PATH_ALREADY_EXIST')
});

assertTypesEqual<
  DiskNewPathAlreadyExistError,
  z.infer<typeof zDiskNewPathAlreadyExistError>
>({ value: true });
