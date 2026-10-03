import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileChartOptionsYAxisElement = {
  scale: string;
  scale_line_num?: number;
};

export let zFileChartOptionsYAxisElement = z
  .object({
    scale: z.string(),
    scale_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartOptionsYAxisElement' });

assertTypesEqual<
  FileChartOptionsYAxisElement,
  z.infer<typeof zFileChartOptionsYAxisElement>
>({ value: true });
