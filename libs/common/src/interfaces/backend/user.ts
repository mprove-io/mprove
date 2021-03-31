import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class User {
  @IsString()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  alias: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  timezone: string;

  @IsEnum(enums.UserStatusEnum)
  status: enums.UserStatusEnum;

  @IsBoolean()
  isEmailVerified: boolean;

  @IsInt()
  serverTs: number;
}
