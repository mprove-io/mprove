import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { EnvUser } from './env-user';
import { Ev } from './ev';

export class Env {
  @IsString()
  envId: string;

  @IsString()
  projectId: string;

  @ValidateNested()
  @Type(() => EnvUser)
  envUsers: EnvUser[];

  @IsBoolean()
  isFallbackToProdConnections: boolean;

  @IsBoolean()
  isFallbackToProdVariables: boolean;

  @IsString({ each: true })
  envConnectionIds: string[];

  @IsString({ each: true })
  envConnectionIdsWithFallback: string[];

  @IsString({ each: true })
  fallbackConnectionIds: string[];

  @ValidateNested()
  @Type(() => Ev)
  evs: Ev[];

  @ValidateNested()
  @Type(() => Ev)
  evsWithFallback: Ev[];

  @IsString({ each: true })
  fallbackEvIds: string[];
}
