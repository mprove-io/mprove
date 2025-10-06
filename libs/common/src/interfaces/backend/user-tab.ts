import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Ui } from './ui';

export class UserTab {
  @IsString()
  email: string;

  @IsString()
  alias: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsString()
  emailVerificationToken: string;

  @IsString()
  passwordResetToken: string;

  @IsOptional()
  @IsNumber()
  jwtMinIat: number;

  @IsOptional()
  @IsNumber()
  passwordResetExpiresTs: number;

  @ValidateNested()
  @Type(() => Ui)
  ui: Ui;
}
