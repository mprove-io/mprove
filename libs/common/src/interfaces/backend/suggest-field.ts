import { IsString } from 'class-validator';

export class SuggestField {
  @IsString()
  modelFieldRef: string;

  @IsString()
  topLabel: string;

  @IsString()
  partNodeLabel: string;

  @IsString()
  partFieldLabel: string;
}
