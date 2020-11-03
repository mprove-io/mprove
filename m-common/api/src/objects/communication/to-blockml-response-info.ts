import { IsEnum, IsOptional, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class ToBlockmlResponseInfo {
  @IsEnum(apiEnums.ToBlockmlResponseInfoStatusEnum)
  status: apiEnums.ToBlockmlResponseInfoStatusEnum;

  @IsString()
  traceId: string;

  @IsOptional()
  error?: any;
}
