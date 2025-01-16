import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
export class RowFiltersComponent implements OnChanges {
  parameterTypeFormula = common.ParameterTypeEnum.Formula;

  @Input()
  reportSelectedNode: IRowNode<DataRow>;

  @Input()
  mconfig: common.MconfigX;

  @Input()
  parametersFilters: ParameterFilter[];

  @Input()
  report: common.ReportX;

  myForm: FormGroup;

  waitMconfigChangeFilterId: string;

  constructor(
    private uiQuery: UiQuery,
    private fb: FormBuilder,
    private reportQuery: ReportQuery,
    private reportService: ReportService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // console.log('ngOnChanges');
    // console.log(changes);

    if (common.isDefined(changes.mconfig)) {
      this.waitMconfigChangeFilterId = undefined;
    }

    let opts: any = {};
    this.parametersFilters.forEach(x => (opts[x.fieldId] = [x.listen]));
    this.myForm = this.fb.group(opts);
  }

  fractionUpdate(
    filterExtended: common.FilterX,
    eventFractionUpdate: interfaces.EventFractionUpdate
  ) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
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
      reportFields: report.fields,
      chart: undefined
    });
  }

  addFraction(filterExtended: common.FilterX) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
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
      reportFields: report.fields,
      chart: undefined
    });
  }

  deleteFraction(filterExtended: common.FilterX, fractionIndex: number) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
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
      reportFields: report.fields,
      chart: undefined
    });
  }

  deleteFilter(filterExtended: common.FilterX) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
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
      reportFields: report.fields,
      chart: undefined
    });
  }

  toggleParFormula(filterExtended: common.FilterX) {
    let report = this.reportQuery.getValue();

    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parameterIndex = this.reportSelectedNode.data.parameters.findIndex(
      x => x.apply_to === filterExtended.fieldId
    );

    let parameter: common.Parameter =
      this.reportSelectedNode.data.parameters.find(
        x => x.apply_to === filterExtended.fieldId
      );

    let newParameter;

    if (
      parameter.parameterType === common.ParameterTypeEnum.Formula &&
      common.isUndefined(parameter.listen)
    ) {
      let newConditions = parameter.conditions;

      newParameter = Object.assign({}, parameter, {
        parameterType: common.ParameterTypeEnum.Field,
        conditions: newConditions,
        formula: undefined,
        listen: undefined
      } as common.Parameter);
    } else {
      let newConditions = ['any'];

      let newConditionsStr = newConditions.join('", "');

      newParameter = Object.assign({}, parameter, {
        parameterType: common.ParameterTypeEnum.Formula,
        conditions: newConditions,
        formula: `return {"apply_to": "${parameter.apply_to}", "conditions": ["${newConditionsStr}"]}`,
        listen: undefined
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
      reportFields: report.fields,
      chart: undefined
    });
  }

  toggleListen(pFilter: ParameterFilter) {
    let report = this.reportQuery.getValue();

    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parameterIndex = this.reportSelectedNode.data.parameters.findIndex(
      x => x.apply_to === pFilter.fieldId
    );

    let parameter: common.Parameter =
      this.reportSelectedNode.data.parameters.find(
        x => x.apply_to === pFilter.fieldId
      );

    let newParameter;

    if (common.isDefined(parameter.listen)) {
      let newConditions = parameter.conditions;

      newParameter = Object.assign({}, parameter, {
        parameterType: common.ParameterTypeEnum.Field,
        conditions: newConditions,
        formula: undefined,
        listen: undefined,
        xDeps: undefined
      } as common.Parameter);
    } else {
      let firstGlobalField = this.report.fields[0];

      let globalParameterId = [common.GLOBAL_ROW_ID, firstGlobalField.id]
        .join('_')
        .toUpperCase();

      let formula = `let p = $${globalParameterId}; p.apply_to = '${parameter.apply_to}'; return p`;

      newParameter = Object.assign({}, parameter, {
        parameterType: common.ParameterTypeEnum.Formula,
        conditions: undefined,
        formula: formula,
        listen: firstGlobalField.id,
        xDeps: undefined
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
      reportFields: report.fields,
      chart: undefined
    });
  }

  listenChange(pFilter: ParameterFilter) {
    // console.log('listenChange');

    let newListenValue = this.myForm.controls[pFilter.fieldId].value;

    this.waitMconfigChangeFilterId = pFilter.fieldId;

    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === pFilter.fieldId
    );

    let parameter = newParameters[parametersIndex];

    let globalField = this.report.fields.find(x => x.id === newListenValue);

    let globalParameterId = [common.GLOBAL_ROW_ID, newListenValue]
      .join('_')
      .toUpperCase();

    let formula = `let p = $${globalParameterId}; p.apply_to = '${parameter.apply_to}'; return p`;

    let newParameter: common.Parameter = Object.assign({}, parameter, {
      result: globalField.result,
      conditions: undefined,
      formula: formula,
      listen: newListenValue,
      xDeps: undefined
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
      reportFields: report.fields,
      chart: undefined
    });
  }

  parameterFormulaUpdate(
    eventParameterFormulaUpdate: interfaces.EventParameterFormulaUpdate,
    filterExtended: common.FilterX
  ) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
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
      reportFields: report.fields,
      chart: undefined
    });
  }
}
