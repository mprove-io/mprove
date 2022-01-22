import { ModelField } from '../blockml/model-field';
import { Sorting } from '../blockml/sorting';

export class ModelFieldX extends ModelField {
  sorting: Sorting;
  sortingNumber: number;
  isHideColumn: boolean;
}
