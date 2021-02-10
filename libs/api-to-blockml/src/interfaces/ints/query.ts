import { IsBoolean, IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';

export class Query {
  @IsString()
  queryId: string;

  @IsString({ each: true })
  sql: string[];

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

  @IsBoolean()
  temp: boolean;

  @IsInt()
  serverTs: number;
}
