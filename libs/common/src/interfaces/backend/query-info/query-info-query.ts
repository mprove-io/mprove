import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';

export class QueryInfoQuery {
  @IsString()
  connectionId: string;

  @IsEnum(ConnectionTypeEnum)
  connectionType: ConnectionTypeEnum;

  @IsString()
  queryId: string;

  @IsEnum(QueryStatusEnum)
  status: QueryStatusEnum;

  @IsOptional()
  @IsString()
  lastRunBy: string;

  @IsOptional()
  @IsNumber()
  lastRunTs: number;

  @IsOptional()
  @IsNumber()
  lastCancelTs: number;

  @IsOptional()
  @IsNumber()
  lastCompleteTs: number;

  @IsOptional()
  @IsNumber()
  lastCompleteDuration: number;

  @IsOptional()
  @IsString()
  lastErrorMessage: string;

  @IsOptional()
  @IsNumber()
  lastErrorTs: number;

  @IsOptional()
  data: any;

  @IsOptional()
  @IsString()
  malloy: string;

  @IsOptional()
  @IsString()
  sql: string;
}
