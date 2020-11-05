import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsString
} from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class Query {
  @IsString()
  queryId: string;

  @IsString()
  projectId: string;

  @IsString()
  structId: string;

  // @IsString({ each: true })
  // pdtDeps: string[];

  // @IsString({ each: true })
  // pdtDepsAll: string[];

  @IsString({ each: true })
  sql: string[];

  // @IsBoolean()
  // isPdt: boolean;

  // @IsString()
  // pdtTriggerTime: string;

  // @IsString()
  // pdtTriggerSql: string;

  // @IsBoolean()
  // pdtNeedStartByTime: boolean;

  // @IsBoolean()
  // pdtNeedStartByTriggerSql: boolean;

  // @IsString()
  // pdtTriggerSqlValue: string;

  // @IsString()
  // pdtTriggerSqlLastErrorMessage: string;

  // @IsString()
  // pdtId: string;

  @IsEnum(apiEnums.QueryStatusEnum)
  status: apiEnums.QueryStatusEnum;

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
