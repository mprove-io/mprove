import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Mconfig } from '../blockml/mconfig';
import { MconfigField } from './mconfig-field';

export class MconfigX extends Mconfig {
  @ValidateNested()
  @Type(() => MconfigField)
  fields: MconfigField[];
}
