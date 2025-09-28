import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProjectModelLink {
  @IsString()
  projectId: string;

  @IsString()
  modelId: string;

  @IsOptional()
  @IsInt()
  navTs: number;
}
