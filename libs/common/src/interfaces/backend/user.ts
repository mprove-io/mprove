import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';
import { IsUserTimezone } from '~common/functions/is-user-timezone';
import { Ui } from './ui';

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

  @IsUserTimezone()
  timezone: string;

  @IsBoolean()
  isEmailVerified: boolean;

  @ValidateNested()
  @Type(() => Ui)
  ui: Ui;

  @IsInt()
  serverTs: number;
}
