import { EChartsOption } from 'echarts';

export interface ChartPointsData {
  eChartInitOpts: any;
  eChartOptions: EChartsOption;
  dataPoints: any;
  newQueriesLength: number;
  runningQueriesLength: number;
}
