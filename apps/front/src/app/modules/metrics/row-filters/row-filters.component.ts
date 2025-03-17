import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { STORE_MODEL_PREFIX } from '~common/_index';
import { DataRow } from '~front/app/interfaces/data-row';
import { MetricsQuery } from '~front/app/queries/metrics.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { FilterX2 } from '../row/row.component';

@Component({
  selector: 'm-row-filters',
  templateUrl: './row-filters.component.html'
})
export class RowFiltersComponent {
  @Input()
  reportSelectedNode: IRowNode<DataRow>;

  @Input()
  mconfig: common.MconfigX;

  @Input()
  parametersFilters: FilterX2[];

  @Input()
  report: common.ReportX;

  constructor(
    private fb: FormBuilder,
    private reportQuery: ReportQuery,
    private reportService: ReportService,
    private metricsQuery: MetricsQuery,
    private modelsQuery: ModelsQuery,
    private cd: ChangeDetectorRef
  ) {}

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

  getModelContent() {
    let metric = this.metricsQuery
      .getValue()
      .metrics.find(y => y.metricId === this.reportSelectedNode.data.metricId);

    return this.modelsQuery
      .getValue()
      .models.find(x => x.modelId === metric.modelId)?.content;
  }
}
