import { IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { ServerError } from '~api/models/server-error';

export class ResponseInfo {
  @IsEnum(enums.ResponseInfoStatusEnum)
  status: enums.ResponseInfoStatusEnum;

  @IsString()
  traceId: string;

  @IsOptional()
  error?: ServerError;
}
