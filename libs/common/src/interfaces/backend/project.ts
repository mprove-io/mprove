import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';

export class Project {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  gitUrl: string;

  @IsOptional()
  @IsString()
  defaultBranch: string;

  @IsOptional()
  @IsString()
  publicKey: string;

  @IsOptional()
  @IsBoolean()
  isZenApiKeySet?: boolean;

  @IsOptional()
  @IsBoolean()
  isAnthropicApiKeySet?: boolean;

  @IsOptional()
  @IsBoolean()
  isOpenaiApiKeySet?: boolean;

  @IsOptional()
  @IsBoolean()
  isE2bApiKeySet?: boolean;

  @IsOptional()
  @IsInt()
  serverTs: number;
}
