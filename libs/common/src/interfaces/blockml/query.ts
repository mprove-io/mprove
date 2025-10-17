import {
  IsEnum,
  IsInt,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { StoreMethodEnum } from '~common/enums/store-method.enum';

export class Query {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

  @IsEnum(ConnectionTypeEnum)
  connectionType: ConnectionTypeEnum;

  @IsString()
  queryId: string;

  @IsOptional()
  @IsString()
  sql: string;

  @IsOptional()
  @IsString()
  apiMethod: StoreMethodEnum;

  @IsOptional()
  @IsString()
  apiUrl: string;

  apiBody: any;

  @IsEnum(QueryStatusEnum)
  status: QueryStatusEnum;

  @IsOptional()
  @IsJSON()
  data: any;

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
