import { z } from 'zod';

export let zFileChartData = z
  .object({
    x_field: z.string().nullish(),
    x_field_line_num: z.number().nullish(),
    y_fields: z.array(z.string()).nullish(),
    y_fields_line_num: z.number().nullish(),
    size_field: z.string().nullish(),
    size_field_line_num: z.number().nullish(),
    multi_field: z.string().nullish(),
    multi_field_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartData' });

export type FileChartData = z.infer<typeof zFileChartData>;
