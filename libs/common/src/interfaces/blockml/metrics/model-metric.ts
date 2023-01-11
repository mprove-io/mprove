import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Filter } from '../filter';
import { BaseMetric } from './base-metric';

export class ModelMetric extends BaseMetric {
  @IsString()
  modelId?: string;

  @IsString()
  fieldId?: string;

  @IsString()
  timeFieldId?: string;

  @ValidateNested()
  @Type(() => Filter)
  fixedParameters?: Filter[];
}
