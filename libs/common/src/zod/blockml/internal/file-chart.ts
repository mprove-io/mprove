import { z } from 'zod';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';
import { zFilePartTile } from '#common/zod/blockml/internal/file-part-tile';

export let zFileChart = zFileBasic
  .extend({
    chart: z.string().nullish(),
    chart_line_num: z.number().nullish(),
    hidden: z.string().nullish(),
    hidden_line_num: z.number().nullish(),
    group: z.string().nullish(),
    group_line_num: z.number().nullish(),
    tiles: z.array(zFilePartTile).nullish(),
    tiles_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChart' });

export type FileChart = z.infer<typeof zFileChart>;
