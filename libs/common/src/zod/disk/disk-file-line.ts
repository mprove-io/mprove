import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskFileLine = {
  fileId: string;
  fileName: string;
  lineNumber: number;
};

export let zDiskFileLine = z
  .object({
    fileId: z.string(),
    fileName: z.string(),
    lineNumber: z.number().int()
  })
  .meta({ id: 'DiskFileLine' });

assertTypesEqual<DiskFileLine, z.infer<typeof zDiskFileLine>>({ value: true });
