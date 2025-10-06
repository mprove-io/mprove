import { IsOptional, IsString } from 'class-validator';

export class ProjectTab {
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
  privateKey: string;

  @IsOptional()
  @IsString()
  publicKey: string;
}
