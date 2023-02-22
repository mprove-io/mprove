import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RowChange {
  @IsOptional()
  @IsString()
  rowId?: string;

  @IsOptional()
  @IsString()
  metricId?: string;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsBoolean()
  showChart?: boolean;

  @IsOptional()
  params?: any[];
}
