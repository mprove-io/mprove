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
  json?: any;

  @Input()
  showJson?: boolean;

  @Input()
  mconfigId: string;

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
