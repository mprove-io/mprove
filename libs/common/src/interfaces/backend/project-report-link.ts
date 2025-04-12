import { IsInt, IsString } from 'class-validator';

export class ProjectReportLink {
  @IsString()
  projectId: string;

  @IsString()
  reportId: string;

  @IsInt()
  lastNavTs: number;
}
