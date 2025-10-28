import { Component, Input } from '@angular/core';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '~common/constants/top';
import { ChangeTypeEnum } from '~common/enums/change-type.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { getFractionTypeForAny } from '~common/functions/get-fraction-type-for-any';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ReportX } from '~common/interfaces/backend/report-x';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
import { ModelsQuery } from '~front/app/queries/models.query';
import { ReportService } from '~front/app/services/report.service';

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
      changeType: ChangeTypeEnum.EditParameters,
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

      let logicGroup = isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : store.storeContent.results
            .find(r => r.result === reportField.storeResult)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: FractionLogicEnum.Or,
                typeValue: ft.type,
                value: `${FractionLogicEnum.Or}${TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: FractionLogicEnum.AndNot,
                value: `${FractionLogicEnum.AndNot}${TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === FractionLogicEnum.Or ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFirstTypeFraction?.meta,
        operator: isUndefined(logicGroup)
          ? undefined
          : logicGroup === FractionLogicEnum.Or
            ? FractionOperatorEnum.Or
            : FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        parentBrick: undefined,
        type: FractionTypeEnum.StoreFraction,
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
        operator: FractionOperatorEnum.Or,
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
      changeType: ChangeTypeEnum.EditParameters,
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
      changeType: ChangeTypeEnum.EditParameters,
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
      changeType: ChangeTypeEnum.EditParameters,
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
