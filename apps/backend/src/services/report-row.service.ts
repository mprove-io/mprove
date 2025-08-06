import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { clearRowsCache } from '~backend/functions/clear-rows-cache';
import { processRowIds } from '~backend/functions/process-row-ids';

let retry = require('async-retry');

@Injectable()
export class ReportRowService {
  constructor() {}

  getProcessedRows(item: {
    rowChange: common.RowChange;
    rowIds: string[];
    metrics: common.ModelMetric[];
    models: schemaPostgres.ModelEnt[];
    rows: common.Row[];
    changeType: common.ChangeTypeEnum;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFractionBrick: string;
    struct: schemaPostgres.StructEnt;
    newReportFields: common.ReportField[];
    listeners: common.Listener[];
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
      models,
      struct,
      newReportFields,
      listeners
    } = item;

    let processedRows: common.Row[] = rows.map(row => Object.assign({}, row));

    if (changeType === common.ChangeTypeEnum.AddEmpty) {
      let targetIndex: number;

      if (common.isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y =>
        common.rowIdLetterToNumber(y.rowId)
      );

      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

      let rowIdNumber = common.isDefined(maxRowIdNumber)
        ? maxRowIdNumber + 1
        : 0;

      let rowId = common.rowIdNumberToLetter(rowIdNumber);

      let newRow: common.Row = {
        rowId: rowId,
        rowType: common.RowTypeEnum.Empty,
        name: undefined,
        metricId: undefined,
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

      let targetRows: common.Row[] = [];

      if (common.isDefined(targetIndex)) {
        targetRows = [
          ...processedRows.slice(0, targetIndex + 1),
          newRow,
          ...processedRows.slice(targetIndex + 1, processedRows.length)
        ];

        targetRows.pop();
      }

      processedRows = processRowIds({
        rows: common.isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: common.isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.AddHeader) {
      let targetIndex: number;

      if (common.isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y =>
        common.rowIdLetterToNumber(y.rowId)
      );

      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

      let rowIdNumber = common.isDefined(maxRowIdNumber)
        ? maxRowIdNumber + 1
        : 0;

      let rowId = common.rowIdNumberToLetter(rowIdNumber);

      let newRow: common.Row = {
        rowId: rowId,
        rowType: common.RowTypeEnum.Header,
        name: rowChange.name,
        metricId: undefined,
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

      let targetRows: common.Row[] = [];

      if (common.isDefined(targetIndex)) {
        targetRows = [
          ...processedRows.slice(0, targetIndex + 1),
          newRow,
          ...processedRows.slice(targetIndex + 1, processedRows.length)
        ];

        targetRows.pop();
      }

      processedRows = processRowIds({
        rows: common.isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: common.isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.AddFormula) {
      let targetIndex: number;

      if (common.isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y =>
        common.rowIdLetterToNumber(y.rowId)
      );

      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

      let rowIdNumber = common.isDefined(maxRowIdNumber)
        ? maxRowIdNumber + 1
        : 0;

      let rowId = common.rowIdNumberToLetter(rowIdNumber);

      let newRow: common.Row = {
        rowId: rowId,
        rowType: common.RowTypeEnum.Formula,
        name: rowChange.name,
        metricId: undefined,
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
        formatNumber: struct.formatNumber,
        currencyPrefix: struct.currencyPrefix,
        currencySuffix: struct.currencySuffix
      };

      processedRows.push(newRow);

      let targetRows: common.Row[] = [];

      if (common.isDefined(targetIndex)) {
        targetRows = [
          ...processedRows.slice(0, targetIndex + 1),
          newRow,
          ...processedRows.slice(targetIndex + 1, processedRows.length)
        ];

        targetRows.pop();
      }

      processedRows = processRowIds({
        rows: common.isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: common.isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.AddMetric) {
      let targetIndex: number;

      if (common.isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y =>
        common.rowIdLetterToNumber(y.rowId)
      );

      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;

      let rowIdNumber = common.isDefined(maxRowIdNumber)
        ? maxRowIdNumber + 1
        : 0;

      let rowId = common.rowIdNumberToLetter(rowIdNumber);

      let metric: common.ModelMetric = metrics.find(
        m => m.metricId === rowChange.metricId
      );

      let newRow: common.Row = {
        rowId: rowId,
        rowType: rowChange.rowType,
        name: undefined,
        metricId: rowChange.metricId,
        topLabel: metric.topLabel,
        partNodeLabel: metric.partNodeLabel,
        partFieldLabel: metric.partFieldLabel,
        partLabel: metric.partLabel,
        timeNodeLabel: metric.timeNodeLabel,
        timeFieldLabel: metric.timeFieldLabel,
        timeLabel: metric.timeLabel,
        showChart: rowChange.showChart,
        parameters: common.isDefined(rowChange.parameters)
          ? rowChange.parameters
          : [],
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

      let targetRows: common.Row[] = [];

      if (common.isDefined(targetIndex)) {
        targetRows = [
          ...processedRows.slice(0, targetIndex + 1),
          newRow,
          ...processedRows.slice(targetIndex + 1, processedRows.length)
        ];

        targetRows.pop();
      }

      processedRows = processRowIds({
        rows: common.isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: common.isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.EditInfo) {
      let pRow = processedRows.find(row => row.rowId === rowChange.rowId);

      let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
        showChart: common.isDefined(rowChange.showChart)
          ? rowChange.showChart
          : pRow.showChart,
        name: common.isDefined(rowChange.name) ? rowChange.name : pRow.name,
        formatNumber: common.isDefined(rowChange.formatNumber)
          ? rowChange.formatNumber
          : pRow.formatNumber,
        currencyPrefix: common.isDefined(rowChange.currencyPrefix)
          ? rowChange.currencyPrefix
          : pRow.currencyPrefix,
        currencySuffix: common.isDefined(rowChange.currencySuffix)
          ? rowChange.currencySuffix
          : pRow.currencySuffix
      });

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );
      // } else if (changeType === common.ChangeTypeEnum.ConvertToHeader) {
      //   let pRow = processedRows.find(row => row.rowId === rowChange.rowId);

      //   let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
      //     rowType: common.RowTypeEnum.Header,
      //     name: rowChange.name
      //   });

      //   processedRows = processedRows.map(row =>
      //     row.rowId === editRow.rowId ? editRow : row
      //   );
      // } else if (changeType === common.ChangeTypeEnum.ConvertToMetric) {
      //   let metric: common.ModelMetric = metrics.find(
      //     m => m.metricId === rowChange.metricId
      //   );

      //   let model = models.find(m => m.modelId === metric.modelId);

      //   let editRow: common.Row = {
      //     rowId: rowChange.rowId,
      //     rowType: common.RowTypeEnum.Metric,
      //     name: undefined,
      //     metricId: metric.metricId,
      //     topLabel: metric.topLabel,
      //     partNodeLabel: metric.partNodeLabel,
      //     partFieldLabel: metric.partFieldLabel,
      //     partLabel: metric.partLabel,
      //     timeNodeLabel: metric.timeNodeLabel,
      //     timeFieldLabel: metric.timeFieldLabel,
      //     timeLabel: metric.timeLabel,
      //     showChart: false,
      //     parameters:
      //       model.type !== common.ModelTypeEnum.Store
      //         ? []
      //         : (model.content as common.FileStore).fields
      //             .filter(
      //               x =>
      //                 x.fieldClass === common.FieldClassEnum.Filter &&
      //                 common.toBooleanFromLowercaseString(x.required) === true
      //             )
      //             .map(storeFilter => {
      //               let newControls: common.FractionControl[] = [];

      //               storeFilter.fraction_controls.forEach(
      //                 storeFractionControl => {
      //                   let newControl: common.FractionControl = {
      //                     isMetricsDate: storeFractionControl.isMetricsDate,
      //                     options: storeFractionControl.options,
      //                     value: storeFractionControl.value,
      //                     label: storeFractionControl.label,
      //                     required: storeFractionControl.required,
      //                     name: storeFractionControl.name,
      //                     controlClass: storeFractionControl.controlClass
      //                   };

      //                   newControls.push(newControl);
      //                 }
      //               );

      //               let newFraction: common.Fraction = {
      //                 type: common.FractionTypeEnum.StoreFraction,
      //                 controls: newControls,
      //                 brick: undefined as any,
      //                 operator: undefined as any
      //               };

      //               let newParameter: common.Parameter = {
      //                 apply_to: storeFilter.name,
      //                 fractions: [newFraction],
      //                 listen: undefined
      //               };

      //               return newParameter;
      //             }),
      //     parametersFiltersWithExcludedTime: [],
      //     formula: undefined,
      //     deps: undefined,
      //     formulaDeps: undefined,
      //     rqs: [],
      //     mconfig: undefined,
      //     query: undefined,
      //     hasAccessToModel: false,
      //     records: [],
      //     formatNumber: metric.formatNumber,
      //     currencyPrefix: metric.currencyPrefix,
      //     currencySuffix: metric.currencySuffix
      //   };

      //   processedRows = processedRows.map(row =>
      //     row.rowId === editRow.rowId ? editRow : row
      //   );

      //   processedRows = processRowIds({
      //     rows: processedRows,
      //     targetRowIds: processedRows.map(pr => pr.rowId)
      //   });
      // } else if (changeType === common.ChangeTypeEnum.ConvertToFormula) {
      //   let editRow: common.Row = {
      //     rowId: rowChange.rowId,
      //     rowType: common.RowTypeEnum.Formula,
      //     name: rowChange.name,
      //     metricId: undefined,
      //     topLabel: undefined,
      //     partNodeLabel: undefined,
      //     partFieldLabel: undefined,
      //     partLabel: undefined,
      //     timeNodeLabel: undefined,
      //     timeFieldLabel: undefined,
      //     timeLabel: undefined,
      //     showChart: false,
      //     parameters: undefined,
      //     parametersFiltersWithExcludedTime: [],
      //     deps: undefined,
      //     formulaDeps: undefined,
      //     formula: rowChange.formula,
      //     rqs: [],
      //     mconfig: undefined,
      //     query: undefined,
      //     hasAccessToModel: false,
      //     records: [],
      //     formatNumber: struct.formatNumber,
      //     currencyPrefix: struct.currencyPrefix,
      //     currencySuffix: struct.currencySuffix
      //   };

      //   processedRows = processedRows.map(row =>
      //     row.rowId === editRow.rowId ? editRow : row
      //   );

      //   processedRows = processRowIds({
      //     rows: processedRows,
      //     targetRowIds: processedRows.map(pr => pr.rowId)
      //   });
    } else if (changeType === common.ChangeTypeEnum.EditFormula) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: [rowChange.rowId],
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      let pRow = processedRows.find(r => r.rowId === rowChange.rowId);

      let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
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
    } else if (changeType === common.ChangeTypeEnum.EditParameters) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: [],
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      if (common.isDefined(rowChange)) {
        let pRow = processedRows.find(r => r.rowId === rowChange.rowId);

        let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
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
    } else if (changeType === common.ChangeTypeEnum.EditListeners) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: [],
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      processedRows = processedRows.map(row => {
        if (common.isUndefined(row.parameters)) {
          return row;
        }

        let newParameters: common.Parameter[] = [];

        row.parameters.forEach(rowParameter => {
          let listener = listeners.find(
            l => l.rowId === row.rowId && l.applyTo === rowParameter.apply_to
          );

          if (common.isDefined(listener)) {
            let reportField = newReportFields.find(
              f => f.id === listener.listen
            );

            let editParameter: common.Parameter = Object.assign(
              {},
              rowParameter,
              <common.Parameter>{
                listen: listener.listen,
                fractions: reportField.fractions
              }
            );

            newParameters.push(editParameter);
          } else {
            let editParameter: common.Parameter = Object.assign(
              {},
              rowParameter,
              <common.Parameter>{
                listen: undefined
              }
            );

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

            let newParameter: common.Parameter = {
              apply_to: l.applyTo,
              fractions: reportField.fractions,
              listen: l.listen
            };

            newParameters.push(newParameter);
          });

        let editRow: common.Row = Object.assign({}, row, <common.Row>{
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
      // } else if (changeType === common.ChangeTypeEnum.Clear) {
      //   clearRowsCache({
      //     processedRows: processedRows,
      //     changedRowIds: rowIds,
      //     timezone: timezone,
      //     timeSpec: timeSpec,
      //     timeRangeFractionBrick: timeRangeFractionBrick
      //   });

      //   processedRows = processedRows.map(row => {
      //     if (rowIds.indexOf(row.rowId) > -1) {
      //       let emptyRow: common.Row = {
      //         rowId: row.rowId,
      //         rowType: common.RowTypeEnum.Empty,
      //         name: undefined,
      //         metricId: undefined,
      //         topLabel: undefined,
      //         partNodeLabel: undefined,
      //         partFieldLabel: undefined,
      //         partLabel: undefined,
      //         timeNodeLabel: undefined,
      //         timeFieldLabel: undefined,
      //         timeLabel: undefined,
      //         showChart: false,
      //         parameters: [],
      //         parametersFiltersWithExcludedTime: [],
      //         formula: undefined,
      //         deps: undefined,
      //         formulaDeps: undefined,
      //         rqs: [],
      //         mconfig: undefined,
      //         query: undefined,
      //         hasAccessToModel: false,
      //         records: [],
      //         formatNumber: undefined,
      //         currencyPrefix: undefined,
      //         currencySuffix: undefined
      //       };

      //       return emptyRow;
      //     } else {
      //       return row;
      //     }
      //   });

      //   processedRows = processRowIds({
      //     rows: processedRows,
      //     targetRowIds: processedRows.map(pRow => pRow.rowId)
      //   });
    } else if (changeType === common.ChangeTypeEnum.Delete) {
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
    } else if (changeType === common.ChangeTypeEnum.Move) {
      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: rowIds
      });
    } else if (changeType === common.ChangeTypeEnum.EditChart) {
      //
    }

    return processedRows;
  }
}
