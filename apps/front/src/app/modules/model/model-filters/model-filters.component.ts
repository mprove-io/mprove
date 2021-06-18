import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import {
  FilterExtended,
  FractionExtended,
  MconfigQuery
} from '~front/app/queries/mconfig.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';

export class EventFractionUpdate {
  fraction: FractionExtended;
  fractionIndex: number;
}

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
    private cd: ChangeDetectorRef,
    private structService: StructService,
    private mconfigService: MconfigService
  ) {}

  fractionUpdate(
    filterExtended: FilterExtended,
    filterIndex: number,
    eventFractionUpdate: any
  ) {
    console.log(eventFractionUpdate);

    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    let newFractions = [
      ...fractions.slice(0, eventFractionUpdate.fractionIndex),
      eventFractionUpdate.fraction,
      ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    ];

    let newFilter = Object.assign({}, filterExtended, {
      fractions: newFractions
    });

    newMconfig.filters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }
}
