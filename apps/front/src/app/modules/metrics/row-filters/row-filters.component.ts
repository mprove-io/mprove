import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { DataRow } from '~front/app/interfaces/data-row';
import { ReportQuery } from '~front/app/queries/report.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { ParameterFilter } from '../row/row.component';

@Component({
  selector: 'm-row-filters',
  templateUrl: './row-filters.component.html'
})
// implements OnChanges
export class RowFiltersComponent {
  parameterTypeFormula = common.ParameterTypeEnum.Formula;

  @Input()
  reportSelectedNode: IRowNode<DataRow>;

  @Input()
  mconfig: common.MconfigX;

  @Input()
  parametersFilters: ParameterFilter[];

  // uiQuery$ = this.uiQuery.select().pipe(
  //   tap(x => {
  //   })
  // );

  constructor(
    private uiQuery: UiQuery,
    private fb: FormBuilder,
    private reportQuery: ReportQuery,
    private reportService: ReportService,
    private cd: ChangeDetectorRef
  ) {}

  // ngOnChanges(changes: SimpleChanges) {
  // if (this.repSelectedNode.data.rowType === common.RowTypeEnum.Metric) {
  //   setValueAndMark({
  //     // control: this.parFormulaForm.controls['formula'],
  //     // value: this.repSelectedNode.data.parametersFormula
  //   });
  // }
  // }

  fractionUpdate(
    filterExtended: common.FilterX,
    eventFractionUpdate: interfaces.EventFractionUpdate
  ) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.filter === filterExtended.fieldId
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

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields
    });
  }

  addFraction(filterExtended: common.FilterX) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.filter === filterExtended.fieldId
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

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields
    });
  }

  deleteFraction(filterExtended: common.FilterX, fractionIndex: number) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.filter === filterExtended.fieldId
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

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields
    });
  }

  deleteFilter(filterExtended: common.FilterX) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.filter === filterExtended.fieldId
    );

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      ...newParameters.slice(parametersIndex + 1)
    ];

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields
    });
  }

  toggleParFormula(filterExtended: common.FilterX) {
    let report = this.reportQuery.getValue();

    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parameterIndex = this.reportSelectedNode.data.parameters.findIndex(
      x => x.filter === filterExtended.fieldId
    );

    let parameter: common.Parameter =
      this.reportSelectedNode.data.parameters.find(
        x => x.filter === filterExtended.fieldId
      );

    let newParameter;

    if (parameter.parameterType === common.ParameterTypeEnum.Formula) {
      // let newConditions = ['any'];
      let newConditions = parameter.conditions;

      newParameter = Object.assign({}, parameter, {
        parameterType: common.ParameterTypeEnum.Field,
        conditions: newConditions,
        formula: undefined
      } as common.Parameter);
    } else {
      let newConditions = ['any'];
      // let newConditions = parameter.conditions;

      let newConditionsStr = newConditions.join('", "');

      newParameter = Object.assign({}, parameter, {
        parameterType: common.ParameterTypeEnum.Formula,
        conditions: newConditions,
        formula: `return {"filter": "${parameter.filter}", "conditions": ["${newConditionsStr}"]}`
      } as common.Parameter);
    }

    newParameters = [
      ...newParameters.slice(0, parameterIndex),
      newParameter,
      ...newParameters.slice(parameterIndex + 1)
    ];

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields
    });
  }

  parameterFormulaUpdate(
    eventParameterFormulaUpdate: interfaces.EventParameterFormulaUpdate,
    filterExtended: common.FilterX
  ) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.filter === filterExtended.fieldId
    );

    let newParameter = Object.assign({}, newParameters[parametersIndex], {
      formula: eventParameterFormulaUpdate.formula
    } as common.Parameter);

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      newParameter,
      ...newParameters.slice(parametersIndex + 1)
    ];

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields
    });
  }
}
