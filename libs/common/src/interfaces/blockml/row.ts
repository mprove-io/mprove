import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Filter } from './filter';

export class Row {
  @IsString()
  recId: string;

  @ValidateNested()
  @Type(() => Filter)
  params: Filter[];

  @IsString()
  metricId: string;

  // @ValidateNested()
  // @Type(() => TimeData)
  // data: TimeData[];
}
