import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';
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

  @IsString()
  timezone: string;

  @IsBoolean()
  isEmailVerified: boolean;

  @ValidateNested()
  @Type(() => Ui)
  ui: Ui;

  @IsInt()
  serverTs: number;
}
