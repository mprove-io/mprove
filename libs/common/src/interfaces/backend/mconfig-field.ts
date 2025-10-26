import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';
import { ModelField } from '../blockml/model-field';
import { Sorting } from '../blockml/sorting';

export class MconfigField extends ModelField {
  @ValidateNested()
  @Type(() => Sorting)
  sorting: Sorting;

  @IsNumber()
  sortingNumber: number;
}
