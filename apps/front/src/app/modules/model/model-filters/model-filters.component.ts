import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MqQuery } from '~front/app/queries/mq.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-model-filters',
  templateUrl: './model-filters.component.html'
})
export class ModelFiltersComponent {
  @Input() modelContent: any;

  mconfig: common.MconfigX;
  mconfig$ = this.mqQuery.mconfig$.pipe(
    tap(x => {
      this.mconfig = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private mqQuery: MqQuery,
    private cd: ChangeDetectorRef,
    private structService: StructService,
    private mconfigService: MconfigService
  ) {}

  fractionUpdate(
    filterExtended: common.FilterX,
    extendedFilterIndex: number, // TODO: check why index is different from filters index (store)
    eventFractionUpdate: interfaces.EventFractionUpdate
  ) {
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

    let filterIndex = newMconfig.filters
      .map(y => y.fieldId)
      .indexOf(filterExtended.fieldId);

    newMconfig.filters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  addFraction(filterExtended: common.FilterX, filterIndex: number) {
    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    let fraction: common.Fraction = {
      brick: 'any',
      operator: common.FractionOperatorEnum.Or,
      type: common.getFractionTypeForAny(filterExtended.field.result)
    };

    let newFractions = [...fractions, fraction];

    let newFilter = Object.assign({}, filterExtended, {
      fractions: newFractions
    });

    newMconfig.filters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  deleteFraction(
    filterExtended: common.FilterX,
    filterIndex: number,
    fractionIndex: number
  ) {
    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    if (fractions.length === 1) {
      newMconfig.filters = [
        ...newMconfig.filters.slice(0, filterIndex),
        ...newMconfig.filters.slice(filterIndex + 1)
      ];
    } else {
      let newFractions = [
        ...fractions.slice(0, fractionIndex),
        ...fractions.slice(fractionIndex + 1)
      ];

      let newFilter = Object.assign({}, filterExtended, {
        fractions: newFractions
      });

      newMconfig.filters = [
        ...newMconfig.filters.slice(0, filterIndex),
        newFilter,
        ...newMconfig.filters.slice(filterIndex + 1)
      ];
    }

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  deleteFilter(filterExtended: common.FilterX) {
    let newMconfig = this.structService.makeMconfig();

    newMconfig.filters = newMconfig.filters.filter(
      x => x.fieldId !== filterExtended.fieldId
    );

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }
}
