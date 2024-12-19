import { IsBoolean, IsInt, IsString } from 'class-validator';

export class ProjectReportLink {
  @IsString()
  projectId: string;

  @IsString()
  reportId: string;

  @IsBoolean()
  draft: boolean;

  @IsInt()
  lastNavTs: number;
}
