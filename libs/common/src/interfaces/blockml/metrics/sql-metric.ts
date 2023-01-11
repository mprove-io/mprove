import { IsString } from 'class-validator';
import { BaseMetric } from './base-metric';

export class SqlMetric extends BaseMetric {
  @IsString()
  connection: string;

  @IsString()
  sql: string;

  // @ValidateNested()
  // @Type(() => Filter)
  // fixedParameters: Filter[];
}
