import { IsString } from 'class-validator';

export class Cut {
  @IsString()
  modelId: string;

  @IsString()
  modelContent: string;
}
