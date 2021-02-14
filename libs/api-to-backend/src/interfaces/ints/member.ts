import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { enums } from '~api-to-backend/barrels/enums';

export class Member {
  @IsString()
  projectId: string;

  @IsString()
  memberId: string;

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

  @IsBoolean()
  isAdmin: boolean;

  @IsBoolean()
  isEditor: boolean;

  @IsBoolean()
  isExplorer: boolean;

  @IsInt()
  serverTs: number;
}
