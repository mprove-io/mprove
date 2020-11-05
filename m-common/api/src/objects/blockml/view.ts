import { IsBoolean, IsInt, IsString } from 'class-validator';

export class View {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  structId: string;

  @IsString()
  viewId: string;

  @IsString({ each: true })
  viewDeps: string[];

  // @IsBoolean()
  // isPdt: boolean;

  @IsInt()
  serverTs: number;
}
