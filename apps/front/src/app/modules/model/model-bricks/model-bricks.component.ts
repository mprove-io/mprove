import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FilterExtended, MconfigQuery } from '~front/app/queries/mconfig.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-model-bricks',
  templateUrl: './model-bricks.component.html'
})
export class ModelBricksComponent {
  extendedFilters: FilterExtended[];
  extendedFilters$ = this.mconfigQuery.extendedFilters$.pipe(
    tap(x => {
      this.extendedFilters = x;
      this.cd.detectChanges();
    })
  );

  fractionOperatorEnum = common.FractionOperatorEnum;

  constructor(
    private mconfigQuery: MconfigQuery,
    private cd: ChangeDetectorRef
  ) {}
}
