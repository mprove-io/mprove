import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeRepFileText(item: {
  repId: string;
  title: string;
  accessRoles: string[];
  accessUsers: string[];
  rows: common.Row[];
  metrics: entities.MetricEntity[];
  struct: entities.StructEntity;
}) {
  let { repId, title, rows, accessRoles, accessUsers, metrics, struct } = item;

  let rep: common.FileRep = {
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
          ? metrics.find(m => m.metric_id === x.metricId)
          : undefined;

      let row: common.FileRepRow = {
        id: x.rowId,
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
          metric.format_number === x.formatNumber
            ? undefined
            : struct.format_number === x.formatNumber
            ? undefined
            : x.formatNumber,
        currency_prefix:
          x.rowType === common.RowTypeEnum.Metric &&
          metric.currency_prefix === x.currencyPrefix
            ? undefined
            : struct.currency_prefix === x.currencyPrefix
            ? undefined
            : x.currencyPrefix,
        currency_suffix:
          x.rowType === common.RowTypeEnum.Metric &&
          metric.currency_suffix === x.currencySuffix
            ? undefined
            : struct.currency_suffix === x.currencySuffix
            ? undefined
            : x.currencySuffix,
        parameters_formula: common.isDefined(x.parametersFormula)
          ? x.parametersFormula
          : undefined,
        parameters:
          common.isUndefined(x.parametersFormula) &&
          common.isDefined(x.parameters) &&
          x.parameters.length > 0
            ? x.parameters.map(parameter => {
                let p: common.FileRepRowParameter = {
                  id: parameter.parameterId,
                  // type: parameter.parameterType,
                  field: parameter.fieldId,
                  // result: parameter.result,
                  formula: parameter.formula,
                  conditions: common.isUndefined(parameter.formula)
                    ? parameter.conditions
                    : undefined,
                  value: parameter.value
                };

                return p;
              })
            : undefined
      };

      return row;
    })
  };

  let repFileText = common.toYaml(rep);

  return repFileText;
}
