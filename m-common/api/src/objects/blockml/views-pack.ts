import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { ViewsPackView } from './views-pack-view';

export class ViewsPack {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  structId: string;

  @ValidateNested()
  @Type(() => ViewsPackView)
  views: ViewsPackView[];

  @IsInt()
  serverTs: number;
}
