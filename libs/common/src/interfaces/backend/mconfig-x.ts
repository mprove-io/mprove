import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Mconfig } from '../blockml/mconfig';
import { FilterX } from './filter-x';
import { MconfigField } from './mconfig-field';

export class MconfigX extends Mconfig {
  @ValidateNested()
  @Type(() => MconfigField)
  fields: MconfigField[];

  @ValidateNested()
  @Type(() => FilterX)
  extendedFilters: FilterX[];
}
