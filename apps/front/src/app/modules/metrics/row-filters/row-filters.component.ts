import { ChangeDetectorRef, Component } from '@angular/core';
import { IRowNode } from 'ag-grid-community';
import { tap } from 'rxjs/operators';
import { MqQuery } from '~front/app/queries/mq.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { DataRow } from '../rep/rep.component';

@Component({
  selector: 'm-row-filters',
  templateUrl: './row-filters.component.html'
})
export class RowFiltersComponent {
  repSelectedNode: IRowNode<DataRow>;
  mconfig: common.MconfigX;

  uiQuery$ = this.uiQuery.select().pipe(
    tap(x => {
      this.repSelectedNode =
        x.repSelectedNodes.length === 1 ? x.repSelectedNodes[0] : undefined;

      if (
        common.isDefined(this.repSelectedNode) &&
        this.repSelectedNode.data.rowType === common.RowTypeEnum.Metric
      ) {
        this.mconfig = this.repSelectedNode.data.mconfig;
      }

      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private mqQuery: MqQuery,
    private cd: ChangeDetectorRef,
    private structService: StructService,
    private mconfigService: MconfigService
  ) {}

  fractionUpdate(
    filterExtended: common.FilterX,
    filterIndex: number,
    eventFractionUpdate: interfaces.EventFractionUpdate
  ) {
    //   let newMconfig = this.structService.makeMconfig();
    //   let fractions = filterExtended.fractions;
    //   let newFractions = [
    //     ...fractions.slice(0, eventFractionUpdate.fractionIndex),
    //     eventFractionUpdate.fraction,
    //     ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    //   ];
    //   let newFilter = Object.assign({}, filterExtended, {
    //     fractions: newFractions
    //   });
    //   newMconfig.filters = [
    //     ...newMconfig.filters.slice(0, filterIndex),
    //     newFilter,
    //     ...newMconfig.filters.slice(filterIndex + 1)
    //   ];
    //   this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  addFraction(filterExtended: common.FilterX, filterIndex: number) {
    //   let newMconfig = this.structService.makeMconfig();
    //   let fractions = filterExtended.fractions;
    //   let fraction: common.Fraction = {
    //     brick: 'any',
    //     operator: common.FractionOperatorEnum.Or,
    //     type: common.getFractionTypeForAny(filterExtended.field.result)
    //   };
    //   let newFractions = [...fractions, fraction];
    //   let newFilter = Object.assign({}, filterExtended, {
    //     fractions: newFractions
    //   });
    //   newMconfig.filters = [
    //     ...newMconfig.filters.slice(0, filterIndex),
    //     newFilter,
    //     ...newMconfig.filters.slice(filterIndex + 1)
    //   ];
    //   this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  deleteFraction(
    filterExtended: common.FilterX,
    filterIndex: number,
    fractionIndex: number
  ) {
    //   let newMconfig = this.structService.makeMconfig();
    //   let fractions = filterExtended.fractions;
    //   if (fractions.length === 1) {
    //     newMconfig.filters = [
    //       ...newMconfig.filters.slice(0, filterIndex),
    //       ...newMconfig.filters.slice(filterIndex + 1)
    //     ];
    //   } else {
    //     let newFractions = [
    //       ...fractions.slice(0, fractionIndex),
    //       ...fractions.slice(fractionIndex + 1)
    //     ];
    //     let newFilter = Object.assign({}, filterExtended, {
    //       fractions: newFractions
    //     });
    //     newMconfig.filters = [
    //       ...newMconfig.filters.slice(0, filterIndex),
    //       newFilter,
    //       ...newMconfig.filters.slice(filterIndex + 1)
    //     ];
    //   }
    //   this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }
}
