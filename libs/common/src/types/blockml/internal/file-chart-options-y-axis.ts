import { z } from 'zod';

export let zFileChartOptionsYAxisElement = z
  .object({
    scale: z.string(),
    scale_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartOptionsYAxisElement' });

export type FileChartOptionsYAxisElement = z.infer<
  typeof zFileChartOptionsYAxisElement
>;
