import { z } from 'zod';

export let zFileChartOptionsXAxisElement = z
  .object({
    scale: z.string(),
    scale_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartOptionsXAxisElement' });

export type FileChartOptionsXAxisElement = z.infer<
  typeof zFileChartOptionsXAxisElement
>;
