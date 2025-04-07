import { IsBoolean, IsInt, IsString } from 'class-validator';

export class ProjectChartLink {
  @IsString()
  projectId: string;

  @IsString()
  chartId: string;

  @IsBoolean()
  draft: boolean;

  @IsInt()
  lastNavTs: number;
}
