import type { StructTab } from '#backend/drizzle/postgres/tables/structs';
import { clearReportRowsCache } from '#backend/functions/db/reports/get-processed-report-rows/clear-report-rows-cache/clear-report-rows-cache';
import { processReportRowIds } from '#backend/functions/db/reports/process-report-row-ids/process-report-row-ids';
import { reportRowIdLetterToNumber } from '#backend/functions/db/reports/report-row-id-letter-to-number/report-row-id-letter-to-number';
import { reportRowIdNumberToLetter } from '#backend/functions/db/reports/report-row-id-number-to-letter/report-row-id-number-to-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { ReportField } from '#common/types/blockml/parts/report/report-field';
import type { ChangeType } from '#common/types/blockml/parts/report/row/change-type';
import type { Listener } from '#common/types/blockml/parts/report/row/listener';
import type { Parameter } from '#common/types/blockml/parts/report/row/parameter';
import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { RowChange } from '#common/types/blockml/parts/report/row/row-change';
import type { TimeSpec } from '#common/types/shared/time/timespec';

export function getProcessedReportRows(item: {
  rowChange: RowChange;
  rowIds: string[];
  metrics: ModelMetric[];
  rows: Row[];
  changeType: ChangeType;
  timezone: string;
  timeSpec: TimeSpec;
  timeRangeFractionBrick: string;
  struct: StructTab;
  newReportFields: ReportField[];
  listeners: Listener[];
}): Row[] {
  let {
    rows,
    rowChange,
    rowIds,
    changeType,
    timezone,
    timeSpec,
    timeRangeFractionBrick,
    metrics,
    struct,
    newReportFields,
    listeners
  } = item;

  let processedRows: Row[] = rows.map(row => Object.assign({}, row));

  if (changeType === 'AddEmpty') {
    let targetIndex: number;

    if (isDefined(rowChange.rowId)) {
      targetIndex = processedRows.findIndex(
        pRow => pRow.rowId === rowChange.rowId
      );
    }

    let rowIdsNumbers: number[] = processedRows.map(y =>
      reportRowIdLetterToNumber({ rowId: y.rowId })
    );

    let maxRowIdNumber =
      rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

    let rowIdNumber = isDefined(maxRowIdNumber) ? maxRowIdNumber + 1 : 0;

    let rowId: string = reportRowIdNumberToLetter({ rowIdNumber: rowIdNumber });

    let newRow: Row = {
      rowId: rowId,
      rowType: 'empty',
      name: undefined,
      metricId: undefined,
      modelId: undefined,
      topLabel: undefined,
      partNodeLabel: undefined,
      partFieldLabel: undefined,
      partLabel: undefined,
      timeNodeLabel: undefined,
      timeFieldLabel: undefined,
      timeLabel: undefined,
      showChart: false,
      parameters: [],
      parametersFiltersWithExcludedTime: [],
      formula: undefined,
      deps: undefined,
      formulaDeps: undefined,
      rqs: [],
      mconfig: undefined,
      query: undefined,
      hasAccessToModel: false,
      records: [],
      formatNumber: undefined,
      currencyPrefix: undefined,
      currencySuffix: undefined
    };

    processedRows.push(newRow);

    let targetRows: Row[] = [];

    if (isDefined(targetIndex)) {
      targetRows = [
        ...processedRows.slice(0, targetIndex + 1),
        newRow,
        ...processedRows.slice(targetIndex + 1, processedRows.length)
      ];

      targetRows.pop();
    }

    processedRows = processReportRowIds({
      rows: isDefined(targetIndex) ? targetRows : processedRows,
      targetRowIds: isDefined(targetIndex)
        ? targetRows.map(pRow => pRow.rowId)
        : processedRows.map(pRow => pRow.rowId)
    });
  } else if (changeType === 'AddHeader') {
    let targetIndex: number;

    if (isDefined(rowChange.rowId)) {
      targetIndex = processedRows.findIndex(
        pRow => pRow.rowId === rowChange.rowId
      );
    }

    let rowIdsNumbers: number[] = processedRows.map(y =>
      reportRowIdLetterToNumber({ rowId: y.rowId })
    );

    let maxRowIdNumber =
      rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

    let rowIdNumber = isDefined(maxRowIdNumber) ? maxRowIdNumber + 1 : 0;

    let rowId: string = reportRowIdNumberToLetter({ rowIdNumber: rowIdNumber });

    let newRow: Row = {
      rowId: rowId,
      rowType: 'header',
      name: rowChange.name,
      metricId: undefined,
      modelId: undefined,
      topLabel: undefined,
      partNodeLabel: undefined,
      partFieldLabel: undefined,
      partLabel: undefined,
      timeNodeLabel: undefined,
      timeFieldLabel: undefined,
      timeLabel: undefined,
      showChart: false,
      parameters: [],
      parametersFiltersWithExcludedTime: [],
      formula: undefined,
      deps: undefined,
      formulaDeps: undefined,
      rqs: [],
      mconfig: undefined,
      query: undefined,
      hasAccessToModel: false,
      records: [],
      formatNumber: undefined,
      currencyPrefix: undefined,
      currencySuffix: undefined
    };

    processedRows.push(newRow);

    let targetRows: Row[] = [];

    if (isDefined(targetIndex)) {
      targetRows = [
        ...processedRows.slice(0, targetIndex + 1),
        newRow,
        ...processedRows.slice(targetIndex + 1, processedRows.length)
      ];

      targetRows.pop();
    }

    processedRows = processReportRowIds({
      rows: isDefined(targetIndex) ? targetRows : processedRows,
      targetRowIds: isDefined(targetIndex)
        ? targetRows.map(pRow => pRow.rowId)
        : processedRows.map(pRow => pRow.rowId)
    });
  } else if (changeType === 'AddFormula') {
    let targetIndex: number;

    if (isDefined(rowChange.rowId)) {
      targetIndex = processedRows.findIndex(
        pRow => pRow.rowId === rowChange.rowId
      );
    }

    let rowIdsNumbers: number[] = processedRows.map(y =>
      reportRowIdLetterToNumber({ rowId: y.rowId })
    );

    let maxRowIdNumber =
      rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

    let rowIdNumber = isDefined(maxRowIdNumber) ? maxRowIdNumber + 1 : 0;

    let rowId: string = reportRowIdNumberToLetter({ rowIdNumber: rowIdNumber });

    let newRow: Row = {
      rowId: rowId,
      rowType: 'formula',
      name: rowChange.name,
      metricId: undefined,
      modelId: undefined,
      topLabel: undefined,
      partNodeLabel: undefined,
      partFieldLabel: undefined,
      partLabel: undefined,
      timeNodeLabel: undefined,
      timeFieldLabel: undefined,
      timeLabel: undefined,
      showChart: false,
      parameters: undefined,
      parametersFiltersWithExcludedTime: [],
      deps: undefined,
      formulaDeps: undefined,
      formula: rowChange.formula,
      rqs: [],
      mconfig: undefined,
      query: undefined,
      hasAccessToModel: false,
      records: [],
      formatNumber: struct.mproveConfig.formatNumber,
      currencyPrefix: struct.mproveConfig.currencyPrefix,
      currencySuffix: struct.mproveConfig.currencySuffix
    };

    processedRows.push(newRow);

    let targetRows: Row[] = [];

    if (isDefined(targetIndex)) {
      targetRows = [
        ...processedRows.slice(0, targetIndex + 1),
        newRow,
        ...processedRows.slice(targetIndex + 1, processedRows.length)
      ];

      targetRows.pop();
    }

    processedRows = processReportRowIds({
      rows: isDefined(targetIndex) ? targetRows : processedRows,
      targetRowIds: isDefined(targetIndex)
        ? targetRows.map(pRow => pRow.rowId)
        : processedRows.map(pRow => pRow.rowId)
    });
  } else if (changeType === 'AddMetric') {
    let targetIndex: number;

    if (isDefined(rowChange.rowId)) {
      targetIndex = processedRows.findIndex(
        pRow => pRow.rowId === rowChange.rowId
      );
    }

    let rowIdsNumbers: number[] = processedRows.map(y =>
      reportRowIdLetterToNumber({ rowId: y.rowId })
    );

    let maxRowIdNumber =
      rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

    let rowIdNumber = isDefined(maxRowIdNumber) ? maxRowIdNumber + 1 : 0;

    let rowId: string = reportRowIdNumberToLetter({ rowIdNumber: rowIdNumber });

    let metric: ModelMetric = metrics.find(
      m => m.metricId === rowChange.metricId
    );

    let newRow: Row = {
      rowId: rowId,
      rowType: rowChange.rowType,
      name: undefined,
      metricId: rowChange.metricId,
      modelId: metric.modelId,
      topLabel: metric.topLabel,
      partNodeLabel: metric.partNodeLabel,
      partFieldLabel: metric.partFieldLabel,
      partLabel: metric.partLabel,
      timeNodeLabel: metric.timeNodeLabel,
      timeFieldLabel: metric.timeFieldLabel,
      timeLabel: metric.timeLabel,
      showChart: rowChange.showChart,
      parameters: isDefined(rowChange.parameters) ? rowChange.parameters : [],
      parametersFiltersWithExcludedTime: [],
      formula: undefined,
      deps: undefined,
      formulaDeps: undefined,
      rqs: [],
      mconfig: undefined,
      query: undefined,
      hasAccessToModel: false,
      records: [],
      formatNumber: metric.formatNumber,
      currencyPrefix: metric.currencyPrefix,
      currencySuffix: metric.currencySuffix
    };

    processedRows.push(newRow);

    let targetRows: Row[] = [];

    if (isDefined(targetIndex)) {
      targetRows = [
        ...processedRows.slice(0, targetIndex + 1),
        newRow,
        ...processedRows.slice(targetIndex + 1, processedRows.length)
      ];

      targetRows.pop();
    }

    processedRows = processReportRowIds({
      rows: isDefined(targetIndex) ? targetRows : processedRows,
      targetRowIds: isDefined(targetIndex)
        ? targetRows.map(pRow => pRow.rowId)
        : processedRows.map(pRow => pRow.rowId)
    });
  } else if (changeType === 'EditInfo') {
    let pRow: Row = processedRows.find(row => row.rowId === rowChange.rowId);

    let editRow: Row = Object.assign({}, pRow, <Row>{
      showChart: isDefined(rowChange.showChart)
        ? rowChange.showChart
        : pRow.showChart,
      name: isDefined(rowChange.name) ? rowChange.name : pRow.name,
      formatNumber: isDefined(rowChange.formatNumber)
        ? rowChange.formatNumber
        : pRow.formatNumber,
      currencyPrefix: isDefined(rowChange.currencyPrefix)
        ? rowChange.currencyPrefix
        : pRow.currencyPrefix,
      currencySuffix: isDefined(rowChange.currencySuffix)
        ? rowChange.currencySuffix
        : pRow.currencySuffix
    });

    processedRows = processedRows.map(row =>
      row.rowId === editRow.rowId ? editRow : row
    );
  } else if (changeType === 'EditFormula') {
    clearReportRowsCache({
      processedRows: processedRows,
      changedRowIds: [rowChange.rowId],
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick
    });

    let pRow: Row = processedRows.find(r => r.rowId === rowChange.rowId);

    let editRow: Row = Object.assign({}, pRow, <Row>{
      formula: rowChange.formula,
      rqs: [],
      records: []
    });

    processedRows = processedRows.map(row =>
      row.rowId === editRow.rowId ? editRow : row
    );

    processedRows = processReportRowIds({
      rows: processedRows,
      targetRowIds: processedRows.map(pr => pr.rowId)
    });
  } else if (changeType === 'EditParameters') {
    clearReportRowsCache({
      processedRows: processedRows,
      changedRowIds: [],
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick
    });

    if (isDefined(rowChange)) {
      let pRow: Row = processedRows.find(r => r.rowId === rowChange.rowId);

      let editRow: Row = Object.assign({}, pRow, <Row>{
        parameters: rowChange.parameters,
        rqs: [],
        records: [],
        mconfig: undefined,
        query: undefined
      });

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );
    }

    processedRows = processReportRowIds({
      rows: processedRows,
      targetRowIds: processedRows.map(pr => pr.rowId)
    });
  } else if (changeType === 'EditListeners') {
    clearReportRowsCache({
      processedRows: processedRows,
      changedRowIds: [],
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick
    });

    processedRows = processedRows.map(row => {
      if (isUndefined(row.parameters)) {
        return row;
      }

      let newParameters: Parameter[] = [];

      row.parameters.forEach(rowParameter => {
        let listener: Listener = listeners.find(
          l => l.rowId === row.rowId && l.applyTo === rowParameter.apply_to
        );

        if (isDefined(listener)) {
          let reportField: ReportField = newReportFields.find(
            f => f.id === listener.listen
          );

          let editParameter: Parameter = Object.assign({}, rowParameter, <
            Parameter
          >{
            listen: listener.listen,
            fractions: reportField.fractions
          });

          newParameters.push(editParameter);
        } else {
          let editParameter: Parameter = Object.assign({}, rowParameter, <
            Parameter
          >{
            listen: undefined
          });

          newParameters.push(editParameter);
        }
      });

      listeners
        .filter(
          l =>
            l.rowId === row.rowId &&
            newParameters.map(p => p.apply_to).indexOf(l.applyTo) < 0
        )
        .forEach(l => {
          let reportField: ReportField = newReportFields.find(
            f => f.id === l.listen
          );

          let newParameter: Parameter = {
            apply_to: l.applyTo,
            fractions: reportField.fractions,
            listen: l.listen
          };

          newParameters.push(newParameter);
        });

      let editRow: Row = Object.assign({}, row, <Row>{
        parameters: newParameters,
        rqs: [],
        records: [],
        mconfig: undefined,
        query: undefined
      });

      return editRow;
    });

    processedRows = processReportRowIds({
      rows: processedRows,
      targetRowIds: processedRows.map(pr => pr.rowId)
    });
  } else if (changeType === 'Delete') {
    clearReportRowsCache({
      processedRows: processedRows,
      changedRowIds: rowIds,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick
    });

    processedRows = processedRows.filter(row => rowIds.indexOf(row.rowId) < 0);

    processedRows = processReportRowIds({
      rows: processedRows,
      targetRowIds: processedRows.map(pRow => pRow.rowId),
      replaceWithUndef: rowIds
    });
  } else if (changeType === 'Move') {
    processedRows = processReportRowIds({
      rows: processedRows,
      targetRowIds: rowIds
    });
  }

  return processedRows;
}
