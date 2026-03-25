import { IsString } from 'class-validator';

export class StateErrorItem {
  @IsString()
  title: string;

  @IsString()
  message: string;
}
