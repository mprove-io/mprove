import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Filter } from '../filter';
import { BaseMetric } from './base-metric';

export class ModelMetric extends BaseMetric {
  @IsString()
  modelId?: string;

  @IsString()
  fieldId?: string;

  @IsEnum(enums.FieldClassEnum)
  fieldClass?: enums.FieldClassEnum;

  @IsString()
  timeFieldId?: string;

  @ValidateNested()
  @Type(() => Filter)
  params?: Filter[];
}
