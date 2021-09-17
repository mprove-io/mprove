import { common } from '~front/barrels/common';

export class ColumnField extends common.ModelField {
  sorting: common.Sorting;
  sortingNumber: number;
  isHideColumn: boolean;
}
