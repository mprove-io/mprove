import { IsInt, IsString } from 'class-validator';

export class ProjectsItem {
  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsInt()
  serverTs: number;
}
