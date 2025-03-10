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
}
