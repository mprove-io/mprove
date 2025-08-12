import { Component, Input } from '@angular/core';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { ModelsQuery } from '~front/app/queries/models.query';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  standalone: false,
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

    let newReportField = Object.assign({}, reportField, {
      fractions: newFractions
    });

    let newReportFields = [
      ...this.report.fields.slice(0, fieldIndex),
      newReportField,
      ...this.report.fields.slice(fieldIndex + 1)
    ];

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  addFraction(reportField: common.ReportField, fieldIndex: number) {
    let fractions = reportField.fractions;

    let newFraction: common.Fraction;

    if (common.isDefined(reportField.storeModel)) {
      let store = this.modelsQuery
        .getValue()
        .models.find(m => m.modelId === reportField.storeModel);
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
        : common.FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = common.isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : (store.content as common.FileStore).results
            .find(r => r.result === reportField.storeResult)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.Or,
                typeValue: ft.type,
                value: `${common.FractionLogicEnum.Or}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.AndNot,
                value: `${common.FractionLogicEnum.AndNot}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

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
            ? `${logicGroup}${common.TRIPLE_UNDERSCORE}${storeResultFirstTypeFraction.type}`
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
    }
    // else if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
    //   newFraction = {
    //     brick: MALLOY_FILTER_ANY,
    //     parentBrick: MALLOY_FILTER_ANY,
    //     operator: common.FractionOperatorEnum.Or,
    //     type: common.getFractionTypeForAny(reportField.result)
    //   };
    // }
    else {
      newFraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(reportField.result)
      };
    }

    let newFractions = [...fractions, newFraction];

    let newReportField = Object.assign({}, reportField, {
      fractions: newFractions
    });

    let newReportFields = [
      ...this.report.fields.slice(0, fieldIndex),
      newReportField,
      ...this.report.fields.slice(fieldIndex + 1)
    ];

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: undefined,
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

      let newReportField = Object.assign({}, reportField, {
        fractions: newFractions
      });

      newReportFields = [
        ...this.report.fields.slice(0, fieldIndex),
        newReportField,
        ...this.report.fields.slice(fieldIndex + 1)
      ];
    }

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  deleteFilter(reportField: common.ReportField) {
    let newReportFields = this.report.fields.filter(
      x => x.id !== reportField.id
    );

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: undefined,
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
