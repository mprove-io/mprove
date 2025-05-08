import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProjectFileLink {
  @IsString()
  projectId: string;

  @IsString()
  fileId: string;

  @IsOptional()
  @IsString()
  secondFileNodeId: string;

  @IsInt()
  lastNavTs: number;
}
