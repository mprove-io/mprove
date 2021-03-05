import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ModelsItem {
  @IsString()
  modelId: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  gr?: string;

  @IsBoolean()
  hidden: boolean;
}
