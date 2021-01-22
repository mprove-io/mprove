import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ServerError } from '../../models/server-error';
import * as apiEnums from '../../enums/_index';

export class ResponseInfo {
  @IsEnum(apiEnums.ResponseInfoStatusEnum)
  status: apiEnums.ResponseInfoStatusEnum;

  @IsString()
  traceId: string;

  @IsOptional()
  error?: ServerError;
}
