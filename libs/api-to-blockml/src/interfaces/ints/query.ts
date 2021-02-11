import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';

export class Query {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;

  @IsString()
  queryId: string;

  @IsString()
  sql: string;

  @IsEnum(common.QueryStatusEnum)
  status: common.QueryStatusEnum;

  @IsString()
  lastRunBy: string;

  @IsInt()
  lastRunTs: number;

  @IsInt()
  lastCancelTs: number;

  @IsInt()
  lastCompleteTs: number;

  @IsNumber()
  lastCompleteDuration: number;

  @IsString()
  lastErrorMessage: string;

  @IsInt()
  lastErrorTs: number;

  @IsString()
  data: string;

  @IsInt()
  serverTs: number;
}
