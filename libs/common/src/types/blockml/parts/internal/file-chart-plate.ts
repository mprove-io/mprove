import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileChartPlate = {
  plate_width?: string;
  plate_width_line_num?: number;
  plate_height?: string;
  plate_height_line_num?: number;
  plate_x?: string;
  plate_x_line_num?: number;
  plate_y?: string;
  plate_y_line_num?: number;
};

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

assertTypesEqual<FileChartPlate, z.infer<typeof zFileChartPlate>>({
  value: true
});
