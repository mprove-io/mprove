import { IsEnum, IsInt, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Project {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsString()
  defaultBranch: string;

  @IsEnum(enums.ProjectRemoteTypeEnum)
  remoteType: enums.ProjectRemoteTypeEnum;

  @IsString()
  gitUrl: string;

  @IsString()
  publicKey: string;

  @IsInt()
  serverTs: number;
}
