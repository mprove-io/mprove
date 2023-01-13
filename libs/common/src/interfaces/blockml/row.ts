import { IsString } from 'class-validator';

export class Row {
  @IsString()
  rowId: string;

  @IsString()
  metricId: string;

  params: any[];

  // @ValidateNested()
  // @Type(() => TimeData)
  // data: TimeData[];
}
