import { IsBoolean, IsInt, IsString } from 'class-validator';

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

  @IsBoolean()
  isEmailVerified: boolean;

  @IsInt()
  serverTs: number;
}
