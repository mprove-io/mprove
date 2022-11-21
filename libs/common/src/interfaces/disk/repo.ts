import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { DiskCatalogNode } from './disk-catalog-node';
import { DiskFileLine } from './disk-file-line';

export class Repo {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  currentBranchId: string;

  @IsEnum(enums.RepoStatusEnum)
  repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => DiskFileLine)
  conflicts: DiskFileLine[];

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  nodes: DiskCatalogNode[];

  changesToCommit?: any[];

  changesToRemote?: any[];
}
