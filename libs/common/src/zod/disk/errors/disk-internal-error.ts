import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskInternalError = {
  code: 'DISK_INTERNAL';
};

export let zDiskInternalError = z.object({
  code: z.literal('DISK_INTERNAL')
});

assertTypesEqual<DiskInternalError, z.infer<typeof zDiskInternalError>>({
  value: true
});
