import { IsString } from 'class-validator';

export class View {
  @IsString()
  viewId: string;

  @IsString()
  filePath: string;

  @IsString({ each: true })
  viewDeps: string[];
}
