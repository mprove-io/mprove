import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '../enums/_index';
import { FileLine } from './file-line';

export class ItemStatus {
  @IsEnum(apiEnums.RepoStatusEnum)
  repoStatus: apiEnums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => FileLine)
  conflicts: FileLine[];

  @IsString()
  currentBranch: string;
}
