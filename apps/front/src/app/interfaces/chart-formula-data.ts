import { EChartsOption } from 'echarts';

export interface ChartFormulaData {
  eChartInitOpts: any;
  eChartOptions: EChartsOption;
  dataPoints: any;
  recordsWithValuesLength: number;
  newQueriesLength: number;
  runningQueriesLength: number;
}
