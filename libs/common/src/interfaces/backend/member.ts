import { IsBoolean, IsInt, IsString } from 'class-validator';

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
  fullName: string;

  @IsString()
  avatarSmall: string;

  @IsString({ each: true })
  roles: string[];

  @IsBoolean()
  isAdmin: boolean;

  @IsBoolean()
  isEditor: boolean;

  @IsBoolean()
  isExplorer: boolean;

  @IsInt()
  serverTs: number;
}
