import { IsEnum, IsInt, IsString } from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export class Project {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsString()
  defaultBranch: string;

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

  @IsString()
  gitUrl: string;

  @IsString()
  publicKey: string;

  @IsInt()
  serverTs: number;
}
