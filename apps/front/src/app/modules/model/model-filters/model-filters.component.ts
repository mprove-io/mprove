import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FilterExtended, MconfigQuery } from '~front/app/queries/mconfig.query';

@Component({
  selector: 'm-model-filters',
  templateUrl: './model-filters.component.html'
})
export class ModelFiltersComponent {
  extendedFilters: FilterExtended[];
  extendedFilters$ = this.mconfigQuery.extendedFilters$.pipe(
    tap(x => {
      this.extendedFilters = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private mconfigQuery: MconfigQuery,
    private cd: ChangeDetectorRef
  ) {}
}
