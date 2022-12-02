import { IsEnum, IsOptional, IsString } from 'class-validator';
import { common } from '~mcli/barrels/common';

export class Config {
  @IsString()
  mproveCliHost?: string;

  @IsString()
  mproveCliEmail?: string;

  @IsString()
  mproveCliPassword?: string;

  @IsEnum(common.BoolEnum)
  mproveCliLogIsJson?: common.BoolEnum;

  // optional

  @IsOptional()
  @IsString()
  mproveCliProjectId?: string;

  @IsOptional()
  @IsEnum(common.BoolEnum)
  mproveCliIsRepoProd?: common.BoolEnum;

  @IsOptional()
  @IsString()
  mproveCliBranchId?: string;

  @IsOptional()
  @IsString()
  mproveCliEnvId?: string;
}
