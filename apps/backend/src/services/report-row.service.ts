import { Injectable } from '@nestjs/common';
import type { StructTab } from '#backend/drizzle/postgres/schema/_tabs';
import { clearRowsCache } from '#backend/functions/clear-rows-cache';
import { processRowIds } from '#backend/functions/process-row-ids';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { RowTypeEnum } from '#common/enums/row-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { rowIdLetterToNumber } from '#common/functions/row-id-letter-to-number';
import { rowIdNumberToLetter } from '#common/functions/row-id-number-to-letter';
import { Listener } from '#common/interfaces/blockml/listener';
import { ModelMetric } from '#common/interfaces/blockml/model-metric';
import { Parameter } from '#common/interfaces/blockml/parameter';
import { ReportField } from '#common/interfaces/blockml/report-field';
import { Row } from '#common/interfaces/blockml/row';
import { RowChange } from '#common/interfaces/blockml/row-change';

@Injectable()
export class ReportRowService {
  constructor() {}

  getProcessedRows(item: {
    rowChange: RowChange;
    rowIds: string[];
    metrics: ModelMetric[];
    rows: Row[];
    changeType: ChangeTypeEnum;
    timezone: string;
    timeSpec: TimeSpecEnum;
    timeRangeFractionBrick: string;
    struct: StructTab;
    newReportFields: ReportField[];
    listeners: Listener[];
  }) {
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

    if (changeType === ChangeTypeEnum.AddEmpty) {
      let targetIndex: number;

      if (isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y => rowIdLetterToNumber(y.rowId));

      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

      let rowIdNumber = isDefined(maxRowIdNumber) ? maxRowIdNumber + 1 : 0;

      let rowId = rowIdNumberToLetter(rowIdNumber);

      let newRow: Row = {
        rowId: rowId,
        rowType: RowTypeEnum.Empty,
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

      processedRows = processRowIds({
        rows: isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === ChangeTypeEnum.AddHeader) {
      let targetIndex: number;

      if (isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y => rowIdLetterToNumber(y.rowId));

      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

      let rowIdNumber = isDefined(maxRowIdNumber) ? maxRowIdNumber + 1 : 0;

      let rowId = rowIdNumberToLetter(rowIdNumber);

      let newRow: Row = {
        rowId: rowId,
        rowType: RowTypeEnum.Header,
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

      processedRows = processRowIds({
        rows: isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === ChangeTypeEnum.AddFormula) {
      let targetIndex: number;

      if (isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y => rowIdLetterToNumber(y.rowId));

      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

      let rowIdNumber = isDefined(maxRowIdNumber) ? maxRowIdNumber + 1 : 0;

      let rowId = rowIdNumberToLetter(rowIdNumber);

      let newRow: Row = {
        rowId: rowId,
        rowType: RowTypeEnum.Formula,
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

      processedRows = processRowIds({
        rows: isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === ChangeTypeEnum.AddMetric) {
      let targetIndex: number;

      if (isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y => rowIdLetterToNumber(y.rowId));

      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

      let rowIdNumber = isDefined(maxRowIdNumber) ? maxRowIdNumber + 1 : 0;

      let rowId = rowIdNumberToLetter(rowIdNumber);

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

      processedRows = processRowIds({
        rows: isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === ChangeTypeEnum.EditInfo) {
      let pRow = processedRows.find(row => row.rowId === rowChange.rowId);

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
    } else if (changeType === ChangeTypeEnum.EditFormula) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: [rowChange.rowId],
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      let pRow = processedRows.find(r => r.rowId === rowChange.rowId);

      let editRow: Row = Object.assign({}, pRow, <Row>{
        formula: rowChange.formula,
        rqs: [],
        records: []
      });

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pr => pr.rowId)
      });
    } else if (changeType === ChangeTypeEnum.EditParameters) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: [],
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      if (isDefined(rowChange)) {
        let pRow = processedRows.find(r => r.rowId === rowChange.rowId);

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

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pr => pr.rowId)
      });
    } else if (changeType === ChangeTypeEnum.EditListeners) {
      clearRowsCache({
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
          let listener = listeners.find(
            l => l.rowId === row.rowId && l.applyTo === rowParameter.apply_to
          );

          if (isDefined(listener)) {
            let reportField = newReportFields.find(
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
            let reportField = newReportFields.find(f => f.id === l.listen);

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

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pr => pr.rowId)
      });
    } else if (changeType === ChangeTypeEnum.Delete) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: rowIds,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      processedRows = processedRows.filter(
        row => rowIds.indexOf(row.rowId) < 0
      );

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pRow => pRow.rowId),
        replaceWithUndef: rowIds
      });
    } else if (changeType === ChangeTypeEnum.Move) {
      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: rowIds
      });
    }

    return processedRows;
  }
}
