import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type MconfigChartSeries = {
  dataField?: string;
  dataRowId?: string;
  type?: EnumValues<typeof ChartTypeEnum>;
  yAxisIndex?: number;
};

export let zMconfigChartSeries = z
  .object({
    dataField: z.string().nullish(),
    dataRowId: z.string().nullish(),
    type: z.enum(ChartTypeEnum).nullish(),
    yAxisIndex: z.number().int().nullish()
  })
  .meta({ id: 'MconfigChartSeries' });

assertTypesEqual<MconfigChartSeries, z.infer<typeof zMconfigChartSeries>>({
  value: true
});
