import { IsEnum, IsOptional, IsString } from 'class-validator';
import * as apiEnums from '~/enums/_index';

export class ProjectConnection {
  @IsString()
  name: string;

  @IsEnum(apiEnums.ConnectionTypeEnum)
  type: apiEnums.ConnectionTypeEnum;

  @IsOptional()
  @IsString()
  bigqueryProject?: string;
}
