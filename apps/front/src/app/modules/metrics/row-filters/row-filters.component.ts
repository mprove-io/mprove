import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { IRowNode } from 'ag-grid-community';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { DataRow } from '../rep/rep.component';

@Component({
  selector: 'm-row-filters',
  templateUrl: './row-filters.component.html'
})
export class RowFiltersComponent {
  @Input()
  repSelectedNode: IRowNode<DataRow>;

  @Input()
  mconfig: common.MconfigX;

  @Input()
  parametersFilters: common.FilterX[];

  // uiQuery$ = this.uiQuery.select().pipe(
  //   tap(x => {
  //   })
  // );

  constructor(
    private uiQuery: UiQuery,
    private repQuery: RepQuery,
    private repService: RepService,
    private cd: ChangeDetectorRef
  ) {}

  fractionUpdate(
    filterExtended: common.FilterX,
    eventFractionUpdate: interfaces.EventFractionUpdate
  ) {
    let newParameters = [...this.repSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.fieldId === filterExtended.fieldId
    );

    let fractions = filterExtended.fractions;

    let newFractions = [
      ...fractions.slice(0, eventFractionUpdate.fractionIndex),
      eventFractionUpdate.fraction,
      ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    ];

    let newParameter = Object.assign({}, newParameters[parametersIndex], {
      conditions: newFractions.map(fraction => fraction.brick)
    } as common.Parameter);

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      newParameter,
      ...newParameters.slice(parametersIndex + 1)
    ];

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  addFraction(filterExtended: common.FilterX) {
    let newParameters = [...this.repSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.fieldId === filterExtended.fieldId
    );

    let fractions = filterExtended.fractions;

    let fraction: common.Fraction = {
      brick: 'any',
      operator: common.FractionOperatorEnum.Or,
      type: common.getFractionTypeForAny(filterExtended.field.result)
    };

    let newFractions = [...fractions, fraction];

    let newParameter = Object.assign({}, newParameters[parametersIndex], {
      conditions: newFractions.map(x => x.brick)
    } as common.Parameter);

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      newParameter,
      ...newParameters.slice(parametersIndex + 1)
    ];

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  deleteFraction(filterExtended: common.FilterX, fractionIndex: number) {
    let newParameters = [...this.repSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.fieldId === filterExtended.fieldId
    );

    let fractions = filterExtended.fractions;

    if (fractions.length === 1) {
      newParameters = [
        ...newParameters.slice(0, parametersIndex),
        ...newParameters.slice(parametersIndex + 1)
      ];
    } else {
      let newFractions = [
        ...fractions.slice(0, fractionIndex),
        ...fractions.slice(fractionIndex + 1)
      ];

      let newParameter = Object.assign({}, newParameters[parametersIndex], {
        conditions: newFractions.map(fraction => fraction.brick)
      } as common.Parameter);

      newParameters = [
        ...newParameters.slice(0, parametersIndex),
        newParameter,
        ...newParameters.slice(parametersIndex + 1)
      ];
    }

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  deleteFilter(filterExtended: common.FilterX) {
    let newParameters = [...this.repSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.fieldId === filterExtended.fieldId
    );

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      ...newParameters.slice(parametersIndex + 1)
    ];

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.repSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.repService.modifyRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined
    });
  }

  toggleParameterFormula(filterExtended: common.FilterX) {}
}
