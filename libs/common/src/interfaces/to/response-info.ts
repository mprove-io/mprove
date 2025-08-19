import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ServerError } from '~common/models/server-error';

export class ResponseInfo {
  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  duration?: number;

  @IsEnum(ResponseInfoStatusEnum)
  status: ResponseInfoStatusEnum;

  @IsString()
  traceId: string;

  @IsOptional()
  error?: ServerError;
}
