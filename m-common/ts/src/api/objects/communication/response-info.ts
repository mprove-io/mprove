import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ServerError } from '~/api/models/server-error';
import * as apiEnums from '~/api/enums/_index';

export class ResponseInfo {
  @IsEnum(apiEnums.ResponseInfoStatusEnum)
  status: apiEnums.ResponseInfoStatusEnum;

  @IsString()
  traceId: string;

  @IsOptional()
  error?: ServerError;
}
