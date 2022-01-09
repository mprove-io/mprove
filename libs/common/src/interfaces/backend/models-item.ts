import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ModelsItem {
  @IsString()
  modelId: string;

  @IsString()
  label: string;

  @IsString()
  filePath: string;

  @IsOptional()
  @IsString()
  gr?: string;

  @IsBoolean()
  hidden: boolean;
}
