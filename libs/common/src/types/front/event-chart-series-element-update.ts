import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigChartSeries,
  zMconfigChartSeries
} from '#common/types/blockml/parts/mconfig-chart-series';

export type EventChartSeriesElementUpdate = {
  seriesDataRowId: string;
  seriesDataField: string;
  seriesPart: MconfigChartSeries;
};

export let zEventChartSeriesElementUpdate = z
  .object({
    seriesDataRowId: z.string(),
    seriesDataField: z.string(),
    seriesPart: zMconfigChartSeries
  })
  .meta({ id: 'EventChartSeriesElementUpdate' });

assertTypesEqual<
  EventChartSeriesElementUpdate,
  z.infer<typeof zEventChartSeriesElementUpdate>
>({ value: true });
