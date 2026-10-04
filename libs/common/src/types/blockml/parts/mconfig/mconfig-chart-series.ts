import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ChartType,
  zChartType
} from '#common/types/blockml/parts/chart/chart-type';

export type MconfigChartSeries = {
  dataField?: string;
  dataRowId?: string;
  type?: ChartType;
  yAxisIndex?: number;
};

export let zMconfigChartSeries = z
  .object({
    dataField: z.string().nullish(),
    dataRowId: z.string().nullish(),
    type: zChartType.nullish(),
    yAxisIndex: z.number().int().nullish()
  })
  .meta({ id: 'MconfigChartSeries' });

assertTypesEqual<MconfigChartSeries, z.infer<typeof zMconfigChartSeries>>({
  value: true
});
