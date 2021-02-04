import { IsEnum } from 'class-validator';
import { enums } from '~api/barrels/enums';

export class Config {
  @IsEnum(enums.BoolEnum)
  mproveLogIsColor?: enums.BoolEnum;

  @IsEnum(enums.BoolEnum)
  mproveLogResponseError?: enums.BoolEnum;

  @IsEnum(enums.BoolEnum)
  mproveLogResponseOk?: enums.BoolEnum;

  @IsEnum(enums.BoolEnum)
  mproveLogOnSender?: enums.BoolEnum;

  @IsEnum(enums.BoolEnum)
  mproveLogOnResponser?: enums.BoolEnum;
}
