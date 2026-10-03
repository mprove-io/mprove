import { z } from 'zod';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigChartPivotValue,
  zMconfigChartPivotValue
} from '#common/types/blockml/parts/mconfig-chart-pivot-value';
import {
  type MconfigChartSeries,
  zMconfigChartSeries
} from '#common/types/blockml/parts/mconfig-chart-series';
import {
  type MconfigChartXAxis,
  zMconfigChartXAxis
} from '#common/types/blockml/parts/mconfig-chart-x-axis';
import {
  type MconfigChartYAxis,
  zMconfigChartYAxis
} from '#common/types/blockml/parts/mconfig-chart-y-axis';
import type { EnumValues } from '#common/types/enum-values';

export type MconfigChart = {
  isValid: boolean;
  type: EnumValues<typeof ChartTypeEnum>;
  title?: string;
  xField?: string;
  yFields?: string[];
  multiField?: string;
  sizeField?: string;
  pivotRows?: string[];
  pivotColumns?: string[];
  pivotValues?: MconfigChartPivotValue[];
  format?: boolean;
  pivotTheme?: string;
  firstColumnWidth?: number;
  valueColumnsWidth?: number;
  xAxis: MconfigChartXAxis;
  yAxis: MconfigChartYAxis[];
  series: MconfigChartSeries[];
};

export let zMconfigChart = z
  .object({
    isValid: z.boolean(),
    type: z.enum(ChartTypeEnum),
    title: z.string().nullish(),
    xField: z.string().nullish(),
    yFields: z.array(z.string()).nullish(),
    multiField: z.string().nullish(),
    sizeField: z.string().nullish(),
    pivotRows: z.array(z.string()).nullish(),
    pivotColumns: z.array(z.string()).nullish(),
    pivotValues: z.array(zMconfigChartPivotValue).nullish(),
    format: z.boolean().nullish(),
    pivotTheme: z.string().nullish(),
    firstColumnWidth: z.number().nullish(),
    valueColumnsWidth: z.number().nullish(),
    xAxis: zMconfigChartXAxis,
    yAxis: z.array(zMconfigChartYAxis),
    series: z.array(zMconfigChartSeries)
  })
  .meta({ id: 'MconfigChart' });

assertTypesEqual<MconfigChart, z.infer<typeof zMconfigChart>>({ value: true });
