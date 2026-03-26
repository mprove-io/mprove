import { IsString } from 'class-validator';

export class StateChartItem {
  @IsString()
  chartId: string;

  @IsString()
  url: string;
}
