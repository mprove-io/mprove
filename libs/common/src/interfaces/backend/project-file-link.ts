import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProjectFileLink {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  fileId: string;

  @IsOptional()
  @IsInt()
  navTs: number;
}
