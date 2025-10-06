import { IsOptional, IsString } from 'class-validator';

export class MemberTab {
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

  @IsString({ each: true })
  roles: string[];
}
