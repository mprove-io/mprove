import { IsInt, IsString } from 'class-validator';

export class ProjectFileLink {
  @IsString()
  projectId: string;

  @IsString()
  fileId: string;

  @IsInt()
  lastNavTs: number;
}
