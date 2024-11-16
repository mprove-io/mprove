import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function makeReportFileText(item: {
  repId: string;
  title: string;
  accessRoles: string[];
  accessUsers: string[];
  rows: common.Row[];
  metrics: schemaPostgres.MetricEnt[];
  struct: schemaPostgres.StructEnt;
}) {
  let { repId, title, rows, accessRoles, accessUsers, metrics, struct } = item;

  let fileReport: common.FileReport = {
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined,
    report: repId,
    title: title,
    access_roles:
      accessRoles.length > 0 ? accessRoles.map(x => x.trim()) : undefined,
    access_users:
      accessUsers.length > 0 ? accessUsers.map(x => x.trim()) : undefined,
    rows: rows.map(x => {
      let metric =
        x.rowType === common.RowTypeEnum.Metric
          ? metrics.find(m => m.metricId === x.metricId)
          : undefined;

      let row: common.FileReportRow = {
        row_id: x.rowId,
        type: x.rowType,
        name:
          x.rowType === common.RowTypeEnum.Empty ||
          x.rowType === common.RowTypeEnum.Metric
            ? undefined
            : x.name,
        metric: x.metricId,
        formula: common.isDefined(x.formula) ? x.formula : undefined,
        show_chart:
          common.isDefined(x.showChart) &&
          x.showChart !== common.REP_ROW_DEFAULT_SHOW_CHART
            ? <any>x.showChart
            : undefined,
        format_number:
          x.rowType === common.RowTypeEnum.Metric &&
          metric.formatNumber === x.formatNumber
            ? undefined
            : struct.formatNumber === x.formatNumber
            ? undefined
            : x.formatNumber,
        currency_prefix:
          x.rowType === common.RowTypeEnum.Metric &&
          metric.currencyPrefix === x.currencyPrefix
            ? undefined
            : struct.currencyPrefix === x.currencyPrefix
            ? undefined
            : x.currencyPrefix,
        currency_suffix:
          x.rowType === common.RowTypeEnum.Metric &&
          metric.currencySuffix === x.currencySuffix
            ? undefined
            : struct.currencySuffix === x.currencySuffix
            ? undefined
            : x.currencySuffix,
        parameters_formula: common.isDefined(x.parametersFormula)
          ? x.parametersFormula
          : undefined,
        parameters:
          [common.RowTypeEnum.Metric].indexOf(x.rowType) < 0
            ? undefined
            : common.isDefined(x.parametersFormula)
            ? undefined
            : common.isDefined(x.parameters)
            ? x.parameters.map(parameter => {
                let p: common.FileReportRowParameter = {
                  // type: parameter.parameterType,
                  filter: parameter.filter,
                  // result: parameter.result,
                  formula: parameter.formula,
                  conditions: common.isUndefined(parameter.formula)
                    ? parameter.conditions
                    : undefined
                };

                return p;
              })
            : []
      };

      return row;
    })
  };

  let fileReportText = common.toYaml(fileReport);

  return fileReportText;
}
