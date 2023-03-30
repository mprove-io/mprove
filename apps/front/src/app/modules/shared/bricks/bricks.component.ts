import { Component, Input } from '@angular/core';
import { common } from '~front/barrels/common';
import { DeleteFilterFnItem } from '../../dashboard/dashboard.component';

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
  mconfigId: string;

  @Input()
  showJson?: boolean;

  @Input()
  parametersJson?: any;

  @Input()
  isParamsCalcValid?: boolean;

  @Input()
  finalRowHeight?: number;

  @Input()
  deleteFilterFn: (item: DeleteFilterFnItem) => void;

  @Input()
  isKeepBackgroundColor: boolean;

  fractionOperatorEnum = common.FractionOperatorEnum;

  constructor() {}

  deleteFilter(filterFieldId: string) {
    this.deleteFilterFn({
      filterFieldId: filterFieldId,
      mconfigId: this.mconfigId
    });
  }
}
