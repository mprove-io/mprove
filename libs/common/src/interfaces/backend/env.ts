import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class EnvUser {
  @IsString()
  alias: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  fullName: string;
}

export class Env {
  @IsString()
  envId: string;

  @IsString()
  projectId: string;

  @IsString({ each: true })
  envConnectionIds: string[];

  @ValidateNested()
  @Type(() => EnvUser)
  envUsers: EnvUser[];
}
