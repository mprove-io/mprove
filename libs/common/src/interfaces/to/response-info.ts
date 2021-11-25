import { IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { ServerError } from '~common/models/server-error';

export class ResponseInfo {
  @IsOptional()
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  method: string;

  @IsEnum(enums.ResponseInfoStatusEnum)
  status: enums.ResponseInfoStatusEnum;

  @IsString()
  traceId: string;

  @IsOptional()
  error?: ServerError;
}
