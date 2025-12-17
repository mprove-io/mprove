import { IsString } from 'class-validator';

export class ModelPart {
  @IsString()
  structId: string;

  @IsString()
  modelId: string;

  @IsString({ each: true })
  accessRoles: string[];
}
