import { IsNumber, IsOptional, IsString } from 'class-validator';

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
}
