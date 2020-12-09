import { IsString } from 'class-validator';

export class ViewsPackView {
  @IsString()
  viewId: string;

  @IsString({ each: true })
  viewDeps: string[];
}
