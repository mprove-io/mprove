import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export class BaseProject {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

  @IsString()
  tab: string;

  @IsOptional()
  @IsInt()
  serverTs: number;
}
