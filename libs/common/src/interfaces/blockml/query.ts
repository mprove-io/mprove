import {
  IsEnum,
  IsInt,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Query {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

  @IsEnum(enums.ConnectionTypeEnum)
  connectionType: enums.ConnectionTypeEnum;

  @IsString()
  queryId: string;

  @IsOptional()
  @IsString()
  sql: string;

  @IsOptional()
  @IsString()
  apiMethod: enums.StoreMethodEnum;

  @IsOptional()
  @IsString()
  apiUrl: string;

  @IsOptional()
  @IsString()
  apiBody: string;

  @IsEnum(enums.QueryStatusEnum)
  status: enums.QueryStatusEnum;

  @IsOptional()
  @IsJSON()
  data: any;
  // data: {
  //   [key: string]: any;
  // }[];

  @IsOptional()
  @IsString()
  lastRunBy: string;

  @IsOptional()
  @IsInt()
  lastRunTs: number;

  @IsOptional()
  @IsInt()
  lastCancelTs: number;

  @IsOptional()
  @IsInt()
  lastCompleteTs: number;

  @IsOptional()
  @IsNumber()
  lastCompleteDuration: number;

  @IsOptional()
  @IsString()
  lastErrorMessage: string;

  @IsOptional()
  @IsInt()
  lastErrorTs: number;

  @IsOptional()
  @IsString()
  queryJobId: string;

  @IsOptional()
  @IsString()
  bigqueryQueryJobId: string;

  @IsInt()
  bigqueryConsecutiveErrorsGetJob: number;

  @IsInt()
  bigqueryConsecutiveErrorsGetResults: number;

  @IsInt()
  serverTs: number;
}
