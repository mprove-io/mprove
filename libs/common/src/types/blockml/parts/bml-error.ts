import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskFileLine,
  zDiskFileLine
} from '#common/types/disk/parts/disk-file-line';

export type BmlError = {
  title: string;
  message: string;
  lines: DiskFileLine[];
};

export let zBmlError = z
  .object({
    title: z.string(),
    message: z.string(),
    lines: z.array(zDiskFileLine)
  })
  .meta({ id: 'BmlError' });

assertTypesEqual<BmlError, z.infer<typeof zBmlError>>({ value: true });
