import { IsString } from 'class-validator';

export class StateMetricItem {
  @IsString()
  metricId: string;

  @IsString()
  name: string;
}
