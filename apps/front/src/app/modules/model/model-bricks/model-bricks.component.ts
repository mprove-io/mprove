import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FilterExtended, MqQuery } from '~front/app/queries/mq.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-model-bricks',
  templateUrl: './model-bricks.component.html'
})
export class ModelBricksComponent {
  extendedFilters: FilterExtended[];
  extendedFilters$ = this.mqQuery.extendedFilters$.pipe(
    tap(x => {
      this.extendedFilters = x;
      this.cd.detectChanges();
    })
  );

  fractionOperatorEnum = common.FractionOperatorEnum;

  constructor(private mqQuery: MqQuery, private cd: ChangeDetectorRef) {}
}
