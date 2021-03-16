import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Query {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;

  @IsEnum(enums.ConnectionTypeEnum)
  connectionType: enums.ConnectionTypeEnum;

  @IsString()
  queryId: string;

  @IsString()
  sql: string;

  @IsEnum(enums.QueryStatusEnum)
  status: enums.QueryStatusEnum;

  @IsOptional()
  @IsString()
  lastRunBy?: string;

  @IsInt()
  lastRunTs: number;

  @IsInt()
  lastCancelTs: number;

  @IsInt()
  lastCompleteTs: number;

  @IsOptional()
  @IsNumber()
  lastCompleteDuration?: number;

  @IsOptional()
  @IsString()
  lastErrorMessage?: string;

  @IsInt()
  lastErrorTs: number;

  @IsOptional()
  @IsString()
  postgresQueryJobId?: string;

  @IsOptional()
  @IsString()
  bigqueryQueryJobId?: string;

  @IsOptional()
  @IsString()
  data?: any;

  @IsInt()
  serverTs: number;
}
