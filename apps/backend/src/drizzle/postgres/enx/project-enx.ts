import { IsOptional, IsString } from 'class-validator';
import { ProjectEnt } from '../schema/projects';

export interface ProjectEnx extends Omit<ProjectEnt, 'st' | 'lt'> {
  st: ProjectSt;
  lt: ProjectLt;
}

export class ProjectSt {
  @IsString()
  name: string;
}

export class ProjectLt {
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
