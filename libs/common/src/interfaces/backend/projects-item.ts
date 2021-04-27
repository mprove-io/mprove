import { IsString } from 'class-validator';

export class ProjectsItem {
  @IsString()
  projectId: string;

  @IsString()
  name: string;
}
