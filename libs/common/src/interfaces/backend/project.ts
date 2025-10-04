import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ProjectTab } from './project-tab';

export class Project {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  defaultBranch: string;

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

  @IsOptional()
  @IsString()
  gitUrl: string;

  @ValidateNested()
  @Type(() => ProjectTab)
  tab: ProjectTab;

  @IsOptional()
  @IsInt()
  serverTs: number;
}
