import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskProjectAlreadyExistError = {
  code: 'DISK_PROJECT_ALREADY_EXIST';
};

export let zDiskProjectAlreadyExistError = z.object({
  code: z.literal('DISK_PROJECT_ALREADY_EXIST')
});

assertTypesEqual<
  DiskProjectAlreadyExistError,
  z.infer<typeof zDiskProjectAlreadyExistError>
>({ value: true });
