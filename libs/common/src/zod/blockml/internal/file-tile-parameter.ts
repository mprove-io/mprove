import { z } from 'zod';
import { zFileFraction } from '#common/zod/blockml/internal/file-fraction';

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

export type FileTileParameter = z.infer<typeof zFileTileParameter>;
