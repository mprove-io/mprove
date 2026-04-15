import { z } from 'zod';

export let zFileChartPlate = z
  .object({
    plate_width: z.string().nullish(),
    plate_width_line_num: z.number().nullish(),
    plate_height: z.string().nullish(),
    plate_height_line_num: z.number().nullish(),
    plate_x: z.string().nullish(),
    plate_x_line_num: z.number().nullish(),
    plate_y: z.string().nullish(),
    plate_y_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartPlate' });

export type FileChartPlate = z.infer<typeof zFileChartPlate>;
