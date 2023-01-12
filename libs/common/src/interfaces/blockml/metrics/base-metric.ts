import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { enums } from '~common/barrels/enums';

export class BaseMetric {
  @IsString()
  structId?: string;

  @IsEnum(enums.MetricTypeEnum)
  type?: enums.MetricTypeEnum;

  @IsString()
  metricId?: string;

  @IsString()
  partId?: string;

  @IsString()
  topNode?: string;

  @IsString()
  topLabel?: string;

  // @IsString()
  // midNode?: string;

  @IsString()
  label?: string;

  @IsString()
  partLabel?: string;

  @IsBoolean()
  hidden?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  serverTs?: number;
}
