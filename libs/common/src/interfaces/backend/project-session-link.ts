import { IsInt, IsOptional, IsString } from 'class-validator';

export class ProjectSessionLink {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsInt()
  navTs: number;
}
