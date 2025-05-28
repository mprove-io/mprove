import { IsOptional, IsString } from 'class-validator';

export class ModelInfo {
  @IsString()
  name: string;

  @IsString()
  connectionId: string;

  @IsOptional()
  @IsString()
  presetId: string;

  @IsOptional()
  @IsString({ each: true })
  accessRoles: string[];
}
