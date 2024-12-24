import { Component, Input } from '@angular/core';
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

  constructor(private reportService: ReportService) {}

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

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields
    });
  }

  addFraction(reportField: common.ReportField, fieldIndex: number) {
    let fractions = reportField.fractions;

    let fraction: common.Fraction = {
      brick: 'any',
      operator: common.FractionOperatorEnum.Or,
      type: common.getFractionTypeForAny(reportField.result)
    };

    let newFractions = [...fractions, fraction];

    let newField = Object.assign({}, reportField, {
      fractions: newFractions
    });

    let newReportFields = [
      ...this.report.fields.slice(0, fieldIndex),
      newField,
      ...this.report.fields.slice(fieldIndex + 1)
    ];

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields
    });
  }

  deleteFraction(
    reportField: common.ReportField,
    fieldIndex: number,
    fractionIndex: number
  ) {
    let fractions = reportField.fractions;

    let newReportFields: common.DashboardField[];

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

    this.reportService.modifyRows({
      report: this.report,
      changeType: common.ChangeTypeEnum.EditParameters,
      rowChange: undefined,
      rowIds: undefined,
      reportFields: newReportFields
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
      reportFields: newReportFields
    });
  }
}
