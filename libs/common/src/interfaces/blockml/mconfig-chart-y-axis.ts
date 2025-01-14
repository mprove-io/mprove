import { IsBoolean } from 'class-validator';

export class MconfigChartYAxis {
  @IsBoolean()
  scale: boolean;
}
