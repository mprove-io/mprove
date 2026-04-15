import { z } from 'zod';
import { zFileStoreFractionType } from '#common/zod/blockml/internal/file-store-fraction-type';

export let zFileStoreResult = z
  .object({
    result: z.string().nullish(),
    result_line_num: z.number().nullish(),
    fraction_types: z.array(zFileStoreFractionType).nullish(),
    fraction_types_line_num: z.number().nullish()
  })
  .meta({ id: 'FileStoreResult' });

export type FileStoreResult = z.infer<typeof zFileStoreResult>;
