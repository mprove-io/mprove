import { IsString } from 'class-validator';

export class Listener {
  @IsString()
  rowId: string;

  @IsString()
  applyTo: string;

  @IsString()
  listen: string;
}
