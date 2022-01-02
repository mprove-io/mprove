import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { MqQuery } from '~front/app/queries/mq.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

export class EventFractionUpdate {
  fraction: common.Fraction;
  fractionIndex: number;
}

@Component({
  selector: 'm-dashboard-filters',
  templateUrl: './dashboard-filters.component.html'
})
export class DashboardFiltersComponent {
  @Input()
  dashboard: common.Dashboard;

  @Input()
  extendedFilters: interfaces.FilterExtended[];

  constructor(
    private mqQuery: MqQuery,
    private cd: ChangeDetectorRef,
    private structService: StructService,
    private mconfigService: MconfigService
  ) {}

  fractionUpdate(
    filterExtended: any,
    filterIndex: number,
    eventFractionUpdate: any
  ) {
    // // console.log(eventFractionUpdate);
    // let newMconfig = this.structService.makeMconfig();
    // let fractions = filterExtended.fractions;
    // let newFractions = [
    //   ...fractions.slice(0, eventFractionUpdate.fractionIndex),
    //   eventFractionUpdate.fraction,
    //   ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    // ];
    // let newFilter = Object.assign({}, filterExtended, {
    //   fractions: newFractions
    // });
    // newMconfig.filters = [
    //   ...newMconfig.filters.slice(0, filterIndex),
    //   newFilter,
    //   ...newMconfig.filters.slice(filterIndex + 1)
    // ];
    // this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  addFraction(filterExtended: any, filterIndex: number) {
    // let newMconfig = this.structService.makeMconfig();
    // let fractions = filterExtended.fractions;
    // let fraction: common.Fraction = {
    //   brick: 'any',
    //   operator: common.FractionOperatorEnum.Or,
    //   type: common.FractionTypeEnum.StringIsAnyValue
    // };
    // let newFractions = [...fractions, fraction];
    // let newFilter = Object.assign({}, filterExtended, {
    //   fractions: newFractions
    // });
    // newMconfig.filters = [
    //   ...newMconfig.filters.slice(0, filterIndex),
    //   newFilter,
    //   ...newMconfig.filters.slice(filterIndex + 1)
    // ];
    // this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  deleteFraction(
    filterExtended: any,
    filterIndex: number,
    fractionIndex: number
  ) {
    // let newMconfig = this.structService.makeMconfig();
    // let fractions = filterExtended.fractions;
    // if (fractions.length === 1) {
    //   newMconfig.filters = [
    //     ...newMconfig.filters.slice(0, filterIndex),
    //     ...newMconfig.filters.slice(filterIndex + 1)
    //   ];
    // } else {
    //   let newFractions = [
    //     ...fractions.slice(0, fractionIndex),
    //     ...fractions.slice(fractionIndex + 1)
    //   ];
    //   let newFilter = Object.assign({}, filterExtended, {
    //     fractions: newFractions
    //   });
    //   newMconfig.filters = [
    //     ...newMconfig.filters.slice(0, filterIndex),
    //     newFilter,
    //     ...newMconfig.filters.slice(filterIndex + 1)
    //   ];
    // }
    // this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }
}
