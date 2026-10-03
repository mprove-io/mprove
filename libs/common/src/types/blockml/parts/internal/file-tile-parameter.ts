import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileFraction,
  zFileFraction
} from '#common/types/blockml/parts/internal/file-fraction';

export type FileTileParameter = {
  apply_to?: string;
  apply_to_line_num?: number;
  listen?: string;
  listen_line_num?: number;
  conditions?: string[];
  conditions_line_num?: number;
  fractions?: FileFraction[];
  fractions_line_num?: number;
};

export let zFileTileParameter = z
  .object({
    apply_to: z.string().nullish(),
    apply_to_line_num: z.number().nullish(),
    listen: z.string().nullish(),
    listen_line_num: z.number().nullish(),
    conditions: z.array(z.string()).nullish(),
    conditions_line_num: z.number().nullish(),
    fractions: z.array(zFileFraction).nullish(),
    fractions_line_num: z.number().nullish()
  })
  .meta({ id: 'FileTileParameter' });

assertTypesEqual<FileTileParameter, z.infer<typeof zFileTileParameter>>({
  value: true
});
