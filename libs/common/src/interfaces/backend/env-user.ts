import { IsString } from 'class-validator';

export class EnvUser {
  @IsString()
  userId: string;

  @IsString()
  alias: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  fullName: string;
}
