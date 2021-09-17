import { Component, Input } from '@angular/core';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-bricks',
  templateUrl: './bricks.component.html'
})
export class BricksComponent {
  @Input()
  extendedFilters: interfaces.FilterExtended[];

  fractionOperatorEnum = common.FractionOperatorEnum;

  constructor() {}
}
