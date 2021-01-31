import { IsEnum, IsOptional, IsString } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import { ServerError } from '~api/models/server-error';

export class ResponseInfo {
  @IsEnum(apiEnums.ResponseInfoStatusEnum)
  status: apiEnums.ResponseInfoStatusEnum;

  @IsString()
  traceId: string;

  @IsOptional()
  error?: ServerError;
}
