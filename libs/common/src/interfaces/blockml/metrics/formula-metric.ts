import { IsString } from 'class-validator';
import { BaseMetric } from './base-metric';

export class FormulaMetric extends BaseMetric {
  @IsString()
  formula: string;

  // @ValidateNested()
  // @Type(() => Filter)
  // fixedParameters: Filter[];
}
