import { IsBoolean } from 'class-validator';

export class MconfigChartXAxis {
  @IsBoolean()
  scale: boolean;
}
