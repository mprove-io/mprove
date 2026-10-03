import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileChartOptionsXAxisElement = {
  scale: string;
  scale_line_num?: number;
};

export let zFileChartOptionsXAxisElement = z
  .object({
    scale: z.string(),
    scale_line_num: z.number().nullish()
  })
  .meta({ id: 'FileChartOptionsXAxisElement' });

assertTypesEqual<
  FileChartOptionsXAxisElement,
  z.infer<typeof zFileChartOptionsXAxisElement>
>({ value: true });
