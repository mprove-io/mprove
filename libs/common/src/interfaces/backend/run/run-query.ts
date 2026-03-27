import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QueryStatusEnum } from '#common/enums/query-status.enum';

export class RunQuery {
  @IsString()
  queryId: string;

  @IsEnum(QueryStatusEnum)
  status: QueryStatusEnum;

  @IsOptional()
  @IsString()
  lastErrorMessage?: string;
}
