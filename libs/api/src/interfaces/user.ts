import { IsEnum, IsInt, IsString } from 'class-validator';
import { enums } from '~api/barrels/enums';

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
  avatarUrlSmall: string;

  @IsString()
  avatarUrlBig: string;

  @IsString()
  timezone: string;

  @IsEnum(enums.UserStatusEnum)
  status: enums.UserStatusEnum;

  @IsInt()
  serverTs: number;
}
