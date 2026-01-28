import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { DiskCatalogNode } from './disk-catalog-node';
import { DiskFileChange } from './disk-file-change';
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

  @IsEnum(RepoStatusEnum)
  repoStatus: RepoStatusEnum;

  @ValidateNested()
  @Type(() => DiskFileLine)
  conflicts: DiskFileLine[];

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  nodes: DiskCatalogNode[];

  @ValidateNested()
  @Type(() => DiskFileChange)
  changesToCommit: DiskFileChange[];

  @ValidateNested()
  @Type(() => DiskFileChange)
  changesToPush: DiskFileChange[];
}
