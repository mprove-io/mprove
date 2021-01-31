import { IsEnum } from 'class-validator';
import * as apiEnums from '~/enums/_index';

export class Config {
  @IsEnum(apiEnums.BoolEnum)
  mproveLogIsColor?: apiEnums.BoolEnum;

  @IsEnum(apiEnums.BoolEnum)
  mproveLogResponseError?: apiEnums.BoolEnum;

  @IsEnum(apiEnums.BoolEnum)
  mproveLogResponseOk?: apiEnums.BoolEnum;

  @IsEnum(apiEnums.BoolEnum)
  mproveLogOnSender?: apiEnums.BoolEnum;

  @IsEnum(apiEnums.BoolEnum)
  mproveLogOnResponser?: apiEnums.BoolEnum;
}
