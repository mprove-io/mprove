import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProjectChartLink {
  @IsString()
  projectId: string;

  @IsString()
  chartId: string;

  @IsOptional()
  @IsInt()
  navTs: number;
}
