import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
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

  @IsBoolean()
  isEmailVerified: boolean;

  @ValidateNested()
  @Type(() => Ui)
  ui: Ui;

  @IsOptional()
  @IsString()
  apiKeyPrefix?: string;

  @IsInt()
  serverTs: number;
}
