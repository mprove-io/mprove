import { Component, Input } from '@angular/core';
import { DeleteFilterFnItem } from '~front/app/interfaces/delete-filter-fn-item';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-bricks',
  templateUrl: './bricks.component.html'
})
export class BricksComponent {
  @Input()
  extendedFilters: common.FilterX[];

  @Input()
  listen: { [a: string]: string };

  @Input()
  formulas: { [a: string]: boolean };

  @Input()
  tileTitle: string;

  @Input()
  showJson?: boolean;

  @Input()
  onlyJson?: boolean;

  @Input()
  parametersJson?: any[];

  @Input()
  jsonMaxHeight?: number;

  @Input()
  deleteFilterFn: (item: DeleteFilterFnItem) => void;

  @Input()
  isKeepBackgroundColor: boolean;

  fractionOperatorEnum = common.FractionOperatorEnum;

  constructor() {}

  deleteFilter(filter: common.FilterX) {
    this.deleteFilterFn({
      filterFieldId: filter.fieldId,
      tileTitle: this.tileTitle
    });
  }
}
