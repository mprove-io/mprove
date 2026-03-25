import { IsString } from 'class-validator';

export class StateModelItem {
  @IsString()
  modelId: string;

  @IsString()
  url: string;
}
