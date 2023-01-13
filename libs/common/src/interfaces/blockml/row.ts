import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Filter } from './filter';

export class Row {
  @IsString()
  rowId: string;

  @IsString()
  metricId: string;

  @ValidateNested()
  @Type(() => Filter)
  params: Filter[];

  // @ValidateNested()
  // @Type(() => TimeData)
  // data: TimeData[];
}
