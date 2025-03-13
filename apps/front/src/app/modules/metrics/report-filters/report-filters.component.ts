import { Component, Input } from '@angular/core';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { ModelsQuery } from '~front/app/queries/models.query';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-report-filters',
  templateUrl: './report-filters.component.html'
})
export class ReportFiltersComponent {
  @Input()
  report: common.ReportX;

  constructor(
    private reportService: ReportService,
    private modelsQuery: ModelsQuery
  ) {}

  fractionUpdate(
    reportField: common.ReportField,
    fieldIndex: number,
    eventFractionUpdate: interfaces.EventFractionUpdate
  ) {
    let fractions = reportField.fractions;

    let newFractions = [
      ...fractions.slice(0, eventFractionUpdate.fractionIndex),
      eventFractionUpdate.fraction,
      ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    ];

    let newField = Object.assign({}, reportField, {
      fractions: newFractions
    });

    let newReportFields = [
      ...this.report.fields.slice(0, fieldIndex),
      newField,
      ...this.report.fields.slice(fieldIndex + 1)
    ];

    let globalRow = this.report.rows.find(
      row => row.rowId === common.GLOBAL_ROW_ID
    );

    let newParameters = newReportFields.map(field => {
      let newParameter: common.Parameter = {
        topParId: field.id,
        parameterId: [globalRow.rowId, field.id].join('_').toUpperCase(),
        parameterType: common.ParameterTypeEnum.Field,
        apply_to: undefined,
        result: field.result,
        store: field.store,
        storeResult: field.storeResult,
        storeFilter: field.storeFilter,
        conditions: common.isUndefined(field.store)
          ? field.fractions.map(fr => fr.brick)
          : [],
        fractions: field.fractions,
        formula: undefined,
        listen: undefined,
        xDeps: undefined
      };

      return newParameter;
    });

    let rowChange: common.RowChange = {
      rowId: common.GLOBAL_ROW_ID,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  addFraction(reportField: common.ReportField, fieldIndex: number) {
    let fractions = reportField.fractions;

    let newFraction: common.Fraction;

    if (common.isDefined(reportField.store)) {
      let store = this.modelsQuery
        .getValue()
        .models.find(m => m.modelId === reportField.store);
      // let store = this.dashboard.storeModels.find(
      //   x => x.modelId === reportField.store
      // );

      let storeFilter = common.isDefined(reportField.storeFilter)
        ? (store.content as common.FileStore).fields.find(
            f => f.name === reportField.storeFilter
          )
        : undefined;

      let storeResultFirstTypeFraction = common.isDefined(
        reportField.storeFilter
      )
        ? undefined
        : (store.content as common.FileStore).results.find(
            r => r.result === reportField.storeResult
          ).fraction_types[0];

      let logicGroup = common.isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : common.isUndefined(storeResultFirstTypeFraction.or) ||
          toBooleanFromLowercaseString(storeResultFirstTypeFraction.or) === true
        ? common.FractionLogicEnum.Or
        : common.FractionLogicEnum.AndNot;

      let storeFractionSubTypeOptions = common.isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : (store.content as common.FileStore).results
            .find(r => r.result === reportField.storeResult)
            .fraction_types.map(ft => {
              let options = [];

              if (
                common.isUndefined(ft.or) ||
                toBooleanFromLowercaseString(ft.or) === true
              ) {
                let optionOr: FractionSubTypeOption = {
                  logicGroup: common.FractionLogicEnum.Or,
                  typeValue: ft.type,
                  value: common.FractionLogicEnum.Or + ft.type,
                  label: ft.label
                };
                options.push(optionOr);
              }

              if (
                common.isUndefined(ft.and_not) ||
                toBooleanFromLowercaseString(ft.and_not) === true
              ) {
                let optionAndNot: FractionSubTypeOption = {
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
        storeResult: reportField.storeResult,
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
        type: common.getFractionTypeForAny(reportField.result)
      };
    }

    let newFractions = [...fractions, newFraction];

    let newField = Object.assign({}, reportField, {
      fractions: newFractions
    });

    let newReportFields = [
      ...this.report.fields.slice(0, fieldIndex),
      newField,
      ...this.report.fields.slice(fieldIndex + 1)
    ];

    let globalRow = this.report.rows.find(
      row => row.rowId === common.GLOBAL_ROW_ID
    );

    let newParameters = newReportFields.map(field => {
      let newParameter: common.Parameter = {
        topParId: field.id,
        parameterId: [globalRow.rowId, field.id].join('_').toUpperCase(),
        parameterType: common.ParameterTypeEnum.Field,
        apply_to: undefined,
        result: field.result,
        store: field.store, // TODO: check
        storeResult: field.storeResult,
        storeFilter: field.storeFilter,
        conditions: common.isUndefined(field.store)
          ? field.fractions.map(fr => fr.brick)
          : [],
        fractions: field.fractions,
        formula: undefined,
        listen: undefined,
        xDeps: undefined
      };

      return newParameter;
    });

    let rowChange: common.RowChange = {
      rowId: common.GLOBAL_ROW_ID,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  deleteFraction(
    reportField: common.ReportField,
    fieldIndex: number,
    fractionIndex: number
  ) {
    let fractions = reportField.fractions;

    let newReportFields: common.ReportField[];

    if (fractions.length === 1) {
      newReportFields = [
        ...this.report.fields.slice(0, fieldIndex),
        ...this.report.fields.slice(fieldIndex + 1)
      ];
    } else {
      let newFractions = [
        ...fractions.slice(0, fractionIndex),
        ...fractions.slice(fractionIndex + 1)
      ];

      let newField = Object.assign({}, reportField, {
        fractions: newFractions
      });

      newReportFields = [
        ...this.report.fields.slice(0, fieldIndex),
        newField,
        ...this.report.fields.slice(fieldIndex + 1)
      ];
    }

    let globalRow = this.report.rows.find(
      row => row.rowId === common.GLOBAL_ROW_ID
    );

    let newParameters = newReportFields.map(field => {
      let newParameter: common.Parameter = {
        topParId: field.id,
        parameterId: [globalRow.rowId, field.id].join('_').toUpperCase(),
        parameterType: common.ParameterTypeEnum.Field,
        apply_to: undefined,
        result: field.result,
        store: field.store,
        storeResult: field.storeResult,
        storeFilter: field.storeFilter,
        conditions: common.isUndefined(field.store)
          ? field.fractions.map(fr => fr.brick)
          : [],
        fractions: field.fractions,
        formula: undefined,
        listen: undefined,
        xDeps: undefined
      };

      return newParameter;
    });

    let rowChange: common.RowChange = {
      rowId: common.GLOBAL_ROW_ID,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  deleteFilter(reportField: common.ReportField) {
    let newReportFields = this.report.fields.filter(
      x => x.id !== reportField.id
    );

    let globalRow = this.report.rows.find(
      row => row.rowId === common.GLOBAL_ROW_ID
    );

    let parameterId = [globalRow.rowId, reportField.id].join('_').toUpperCase();

    let newParameters = globalRow.parameters.filter(
      x => x.parameterId !== parameterId
    );

    let rowChange: common.RowChange = {
      rowId: common.GLOBAL_ROW_ID,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  getModelContent(storeId: string) {
    return this.modelsQuery.getValue().models.find(x => x.modelId === storeId)
      ?.content;
  }

  getMetricsEndDateYYYYMMDD(storeId: string) {
    return this.modelsQuery.getValue().models.find(x => x.modelId === storeId)
      ?.dateRangeIncludesRightSide === true
      ? this.report?.metricsEndDateIncludedYYYYMMDD
      : this.report?.metricsEndDateExcludedYYYYMMDD;
  }
}
