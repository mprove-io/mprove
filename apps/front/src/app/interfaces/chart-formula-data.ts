import { EChartsOption } from 'echarts';

export interface ChartFormulaData {
  eChartInitOpts: any;
  eChartOptions: EChartsOption;
  dataPoints: any;
  newQueriesLength: number;
  runningQueriesLength: number;
}
