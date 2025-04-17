import { IsString } from 'class-validator';

export class Ev {
  @IsString()
  evId: string;

  @IsString()
  val: string;
}
