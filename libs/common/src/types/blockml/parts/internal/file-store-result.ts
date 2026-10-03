import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileStoreFractionType,
  zFileStoreFractionType
} from '#common/types/blockml/parts/internal/file-store-fraction-type';

export type FileStoreResult = {
  result?: string;
  result_line_num?: number;
  fraction_types?: FileStoreFractionType[];
  fraction_types_line_num?: number;
};

export let zFileStoreResult = z
  .object({
    result: z.string().nullish(),
    result_line_num: z.number().nullish(),
    fraction_types: z.array(zFileStoreFractionType).nullish(),
    fraction_types_line_num: z.number().nullish()
  })
  .meta({ id: 'FileStoreResult' });

assertTypesEqual<FileStoreResult, z.infer<typeof zFileStoreResult>>({
  value: true
});
