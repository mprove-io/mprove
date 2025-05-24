import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { EnvUser } from './env-user';
import { Ev } from './ev';

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

  @ValidateNested()
  @Type(() => Ev)
  evs: Ev[];

  @IsBoolean()
  isFallbackToProdConnections: boolean;

  @IsBoolean()
  isFallbackToProdVariables: boolean;
}
