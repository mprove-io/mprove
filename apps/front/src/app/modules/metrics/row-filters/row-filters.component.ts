import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { STORE_MODEL_PREFIX } from '~common/_index';
import { DataRow } from '~front/app/interfaces/data-row';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { ReportQuery } from '~front/app/queries/report.query';
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
    private fb: FormBuilder,
    private reportQuery: ReportQuery,
    private reportService: ReportService,
    private metricsQuery: MetricsQuery,
    private modelsQuery: ModelsQuery,
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
    // console.log('this.reportSelectedNode.data.parameters');
    // console.log(this.reportSelectedNode.data.parameters);

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

    // let metric = this.metricsQuery
    //   .getValue()
    //   .metrics.find(y => y.metricId === this.reportSelectedNode.data.metricId);

    // let isStore = metric.modelId.startsWith(STORE_MODEL_PREFIX);

    let newParameter = Object.assign({}, newParameters[parametersIndex], {
      // conditions:
      //   isStore === false
      //     ? newFractions.map(fraction => fraction.brick)
      //     : undefined,
      fractions: newFractions
      // fractions: isStore === true ? newFractions : undefined
    } as common.Parameter);

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      newParameter,
      ...newParameters.slice(parametersIndex + 1)
    ];

    // console.log('newParameters');
    // console.log(newParameters);

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

    let newFraction: common.Fraction;

    let metric = this.metricsQuery
      .getValue()
      .metrics.find(y => y.metricId === this.reportSelectedNode.data.metricId);

    let isStore = metric.modelId.startsWith(STORE_MODEL_PREFIX);

    if (isStore === true) {
      let store = this.modelsQuery
        .getValue()
        .models.find(m => m.modelId === metric.modelId)
        .content as common.FileStore;

      let field = filterExtended.field;

      let storeFilter =
        field.fieldClass === common.FieldClassEnum.Filter
          ? store.fields.find(f => f.name === field.id)
          : undefined;

      let storeResultFirstTypeFraction =
        field.fieldClass === common.FieldClassEnum.Filter
          ? undefined
          : store.results.find(r => r.result === field.result)
              .fraction_types[0];

      let logicGroup = common.isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : common.isUndefined(storeResultFirstTypeFraction.or) ||
          common.toBooleanFromLowercaseString(
            storeResultFirstTypeFraction.or
          ) === true
        ? common.FractionLogicEnum.Or
        : common.FractionLogicEnum.AndNot;

      let storeFractionSubTypeOptions = common.isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : store.results
            .find(r => r.result === field.result)
            .fraction_types.map(ft => {
              let options = [];

              if (
                common.isUndefined(ft.or) ||
                common.toBooleanFromLowercaseString(ft.or) === true
              ) {
                let optionOr: common.FractionSubTypeOption = {
                  logicGroup: common.FractionLogicEnum.Or,
                  typeValue: ft.type,
                  value: common.FractionLogicEnum.Or + ft.type,
                  label: ft.label
                };
                options.push(optionOr);
              }

              if (
                common.isUndefined(ft.and_not) ||
                common.toBooleanFromLowercaseString(ft.and_not) === true
              ) {
                let optionAndNot: common.FractionSubTypeOption = {
                  logicGroup: common.FractionLogicEnum.AndNot,
                  value: common.FractionLogicEnum.AndNot + ft.type,
                  typeValue: ft.type,
                  label: ft.label
                };
                options.push(optionAndNot);
              }

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === common.FractionLogicEnum.Or ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFirstTypeFraction?.meta,
        operator: common.isUndefined(logicGroup)
          ? undefined
          : logicGroup === common.FractionLogicEnum.Or
          ? common.FractionOperatorEnum.Or
          : common.FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        type: common.FractionTypeEnum.StoreFraction,
        storeResult: field.result,
        storeFractionSubTypeOptions: storeFractionSubTypeOptions,
        storeFractionSubType: storeResultFirstTypeFraction?.type,
        storeFractionSubTypeLabel: common.isDefined(
          storeResultFirstTypeFraction?.type
        )
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFirstTypeFraction?.type
            ).label
          : storeResultFirstTypeFraction?.type,
        storeFractionLogicGroupWithSubType:
          common.isDefined(logicGroup) &&
          common.isDefined(storeResultFirstTypeFraction?.type)
            ? logicGroup + storeResultFirstTypeFraction.type
            : undefined,
        controls: common.isUndefined(storeResultFirstTypeFraction)
          ? storeFilter.fraction_controls.map(control => {
              let newControl: common.FractionControl = {
                options: control.options,
                value: control.value,
                label: control.label,
                required: control.required,
                name: control.name,
                controlClass: control.controlClass,
                isMetricsDate: control.isMetricsDate
              };
              return newControl;
            })
          : storeResultFirstTypeFraction.controls.map(control => {
              let newControl: common.FractionControl = {
                options: control.options,
                value: control.value,
                label: control.label,
                required: control.required,
                name: control.name,
                controlClass: control.controlClass,
                isMetricsDate: control.isMetricsDate
              };
              return newControl;
            })
      };
    } else {
      newFraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(filterExtended.field.result)
      };
    }

    let newFractions = [...fractions, newFraction];

    let newParameter = Object.assign({}, newParameters[parametersIndex], {
      // conditions:
      //   isStore === false
      //     ? newFractions.map(fraction => fraction.brick)
      //     : undefined,
      fractions: newFractions
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

      // let metric = this.metricsQuery
      //   .getValue()
      //   .metrics.find(
      //     y => y.metricId === this.reportSelectedNode.data.metricId
      //   );

      // let isStore = metric.modelId.startsWith(STORE_MODEL_PREFIX);

      let newParameter = Object.assign({}, newParameters[parametersIndex], {
        // conditions:
        //   isStore === false
        //     ? newFractions.map(fraction => fraction.brick)
        //     : undefined,
        fractions: newFractions
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

  getModelContent() {
    let metric = this.metricsQuery
      .getValue()
      .metrics.find(y => y.metricId === this.reportSelectedNode.data.metricId);

    return this.modelsQuery
      .getValue()
      .models.find(x => x.modelId === metric.modelId)?.content;
  }
}
