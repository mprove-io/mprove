import { IsString } from 'class-validator';
import { BaseMetric } from './base-metric';

export class ApiMetric extends BaseMetric {
  @IsString()
  apiId: string;

  // @ValidateNested()
  // @Type(() => Filter)
  // fixedParameters: Filter[];
}
