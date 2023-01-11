import { Type } from 'class-transformer';
import { IsEnum, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { TimeData } from '../time-data';
import { BaseMetric } from './base-metric';

export class EntryMetric extends BaseMetric {
  @IsEnum(enums.TimeSpecEnum)
  timeSpec?: enums.TimeSpecEnum;

  @ValidateNested()
  @Type(() => TimeData)
  entries?: TimeData[];

  // @ValidateNested()
  // @Type(() => Filter)
  // fixedParameters: Filter[];   // for info only?
}
