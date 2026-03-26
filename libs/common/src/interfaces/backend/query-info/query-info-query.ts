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

  @IsString()
  lastRunBy: string;

  @IsNumber()
  lastRunTs: number;

  @IsNumber()
  lastCancelTs: number;

  @IsNumber()
  lastCompleteTs: number;

  @IsNumber()
  lastCompleteDuration: number;

  @IsString()
  lastErrorMessage: string;

  @IsNumber()
  lastErrorTs: number;

  @IsOptional()
  data: any;

  @IsOptional()
  @IsString()
  sql: string;
}
