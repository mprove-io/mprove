import { IsEnum, IsString } from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export class BaseProject {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

  @IsString()
  st: string;

  @IsString()
  lt: string;
}
