import { Component, Input } from '@angular/core';
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
  deleteFilterFn: (filterFieldId: string) => any;

  fractionOperatorEnum = common.FractionOperatorEnum;

  constructor() {}

  deleteFilter(filterFieldId: string) {
    this.deleteFilterFn(filterFieldId);
  }
}
