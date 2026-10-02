import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ChartLt = {
  emptyData?: number;
};

export let zChartLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'ChartLt' });

assertTypesEqual<ChartLt, z.infer<typeof zChartLt>>({ value: true });
