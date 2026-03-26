import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { QueryInfoQuery } from '#common/interfaces/backend/query-info/query-info-query';
import { Parameter } from '#common/interfaces/blockml/parameter';

export class QueryInfoRow {
  @IsString()
  rowId: string;

  @IsString()
  name: string;

  @IsEnum(RowTypeEnum)
  rowType: RowTypeEnum;

  @IsString()
  metricId: string;

  @IsString()
  formula: string;

  @ValidateNested()
  @Type(() => Parameter)
  parameters: Parameter[];

  @IsOptional()
  @ValidateNested()
  @Type(() => QueryInfoQuery)
  query: QueryInfoQuery;

  @IsOptional()
  records: any[];
}
