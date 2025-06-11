import { IsOptional, IsString } from 'class-validator';

export class BmlFile {
  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  pathRelativeToRepo?: string;

  @IsOptional()
  @IsString()
  blockmlPath?: string;

  @IsString()
  content: string;
}
