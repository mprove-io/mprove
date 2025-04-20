import { IsInt, IsString } from 'class-validator';

export class ProjectChartLink {
  @IsString()
  projectId: string;

  @IsString()
  chartId: string;

  @IsInt()
  lastNavTs: number;
}
