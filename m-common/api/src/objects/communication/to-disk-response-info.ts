import { IsEnum, IsOptional, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class ToDiskResponseInfo {
  @IsEnum(apiEnums.ToDiskResponseInfoStatusEnum)
  status: apiEnums.ToDiskResponseInfoStatusEnum;

  @IsString()
  traceId: string;

  @IsOptional()
  error?: any;
}
