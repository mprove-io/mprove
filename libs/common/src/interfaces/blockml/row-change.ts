import { IsOptional, IsString } from 'class-validator';

export class RowChange {
  @IsOptional()
  @IsString()
  rowId?: string;

  @IsOptional()
  @IsString()
  metricId?: string;

  @IsOptional()
  params?: any[];

  @IsOptional()
  formula?: string;
}
