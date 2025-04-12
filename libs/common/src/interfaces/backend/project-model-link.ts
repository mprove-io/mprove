import { IsInt, IsString } from 'class-validator';

export class ProjectModelLink {
  @IsString()
  projectId: string;

  @IsString()
  modelId: string;

  @IsInt()
  lastNavTs: number;
}
