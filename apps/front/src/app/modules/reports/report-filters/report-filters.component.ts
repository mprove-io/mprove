import { Component, Input } from '@angular/core';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionLogic } from '#common/types/blockml/parts/fraction/fraction-logic';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { ReportField } from '#common/types/blockml/parts/report/report-field';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import { getFractionTypeForAny } from '#front/app/functions/get-fraction-type-for-any';
import { ModelsQuery } from '#front/app/queries/models.query';
import { ReportService } from '#front/app/services/report.service';

@Component({
  standalone: false,
  selector: 'm-report-filters',
  templateUrl: './report-filters.component.html'
})
export class ReportFiltersComponent {
  @Input()
  report: ReportX;

  constructor(
    private reportService: ReportService,
    private modelsQuery: ModelsQuery
  ) {}

  fractionUpdate(
    reportField: ReportField,
    fieldIndex: number,
    eventFractionUpdate: EventFractionUpdate
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
      changeType: 'EditParameters',
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  addFraction(reportField: ReportField, fieldIndex: number) {
    let fractions = reportField.fractions;

    let newFraction: Fraction;

    if (isDefined(reportField.storeModel)) {
      let store = this.modelsQuery
        .getValue()
        .models.find(m => m.modelId === reportField.storeModel);

      let storeFilter = isDefined(reportField.storeFilter)
        ? store.storeContent.fields.find(
            f => f.name === reportField.storeFilter
          )
        : undefined;

      let storeResultFirstTypeFraction = isDefined(reportField.storeFilter)
        ? undefined
        : store.storeContent.results.find(
            r => r.result === reportField.storeResult
          ).fraction_types[0];

      let logicGroup: FractionLogic = isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : 'OR';

      let storeFractionSubTypeOptions = isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : store.storeContent.results
            .find(r => r.result === reportField.storeResult)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: 'OR',
                typeValue: ft.type,
                value: `OR${TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: 'AND_NOT',
                value: `AND_NOT${TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === 'OR' ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFirstTypeFraction?.meta,
        operator: isUndefined(logicGroup)
          ? undefined
          : logicGroup === 'OR'
            ? 'Or'
            : 'And',
        logicGroup: logicGroup,
        brick: undefined,
        parentBrick: undefined,
        type: 'StoreFraction',
        storeResult: reportField.storeResult,
        storeFractionSubTypeOptions: storeFractionSubTypeOptions,
        storeFractionSubType: storeResultFirstTypeFraction?.type,
        storeFractionSubTypeLabel: isDefined(storeResultFirstTypeFraction?.type)
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFirstTypeFraction?.type
            ).label
          : storeResultFirstTypeFraction?.type,
        storeFractionLogicGroupWithSubType:
          isDefined(logicGroup) && isDefined(storeResultFirstTypeFraction?.type)
            ? `${logicGroup}${TRIPLE_UNDERSCORE}${storeResultFirstTypeFraction.type}`
            : undefined,
        controls: isUndefined(storeResultFirstTypeFraction)
          ? storeFilter.fraction_controls.map(control => {
              let newControl: FractionControl = {
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
              let newControl: FractionControl = {
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
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: 'Or',
        type: getFractionTypeForAny(reportField.result)
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
      changeType: 'EditParameters',
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  deleteFraction(
    reportField: ReportField,
    fieldIndex: number,
    fractionIndex: number
  ) {
    let fractions = reportField.fractions;

    let newReportFields: ReportField[];

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
      changeType: 'EditParameters',
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  deleteFilter(reportField: ReportField) {
    let newReportFields = this.report.fields.filter(
      x => x.id !== reportField.id
    );

    this.reportService.modifyRows({
      report: this.report,
      changeType: 'EditParameters',
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields,
      chart: undefined
    });
  }

  getStoreContent(modelId: string) {
    return this.modelsQuery.getValue().models.find(x => x.modelId === modelId)
      ?.storeContent;
  }

  getMetricsEndDateYYYYMMDD(storeId: string) {
    return this.modelsQuery.getValue().models.find(x => x.modelId === storeId)
      ?.dateRangeIncludesRightSide === true
      ? this.report?.metricsEndDateIncludedYYYYMMDD
      : this.report?.metricsEndDateExcludedYYYYMMDD;
  }
}
