import { IsBoolean, IsString } from 'class-validator';
import { Rep } from '../blockml/rep';

export class RepX extends Rep {
  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteRep: boolean;
}
