import { IsString } from 'class-validator';

export class Row {
  @IsString()
  rowId: string;

  @IsString()
  metricId: string;

  params: any[];

  formula: string;

  records: any[];
}
