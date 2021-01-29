import { IsEnum, IsInt, IsString } from 'class-validator';
import * as apiEnums from '~/api/enums/_index';

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

  @IsEnum(apiEnums.UserStatusEnum)
  status: apiEnums.UserStatusEnum;

  @IsInt()
  serverTs: number;
}
