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

  fractionOperatorEnum = common.FractionOperatorEnum;

  constructor() {}
}
