import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskInvalidRequestError = {
  code: 'DISK_INVALID_REQUEST';
  displayData: { path: string; message: string; code: string }[];
};

export let zDiskInvalidRequestError = z.object({
  code: z.literal('DISK_INVALID_REQUEST'),
  displayData: z.array(
    z.object({
      path: z.string(),
      message: z.string(),
      code: z.string()
    })
  )
});

assertTypesEqual<
  DiskInvalidRequestError,
  z.infer<typeof zDiskInvalidRequestError>
>({ value: true });
