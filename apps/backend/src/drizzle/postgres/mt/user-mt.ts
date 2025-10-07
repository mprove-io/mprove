import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Ui } from '~common/interfaces/backend/ui';
import { UserEnt } from '../schema/users';

export interface UserMt extends Omit<UserEnt, 'st' | 'lt'> {
  st: UserSt;
  lt: UserLt;
}

export class UserSt {}

export class UserLt {
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
  passwordResetExpiresTs: number;

  @ValidateNested()
  @Type(() => Ui)
  ui: Ui;
}
