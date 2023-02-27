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

  let repFileText = common.toYaml({
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

      let row = {
        id: x.rowId,
        type: x.rowType,
        name:
          x.rowType === common.RowTypeEnum.Empty
            ? undefined
            : x.rowType === common.RowTypeEnum.Metric && metric.label === x.name
            ? undefined
            : x.name,
        metric: x.metricId,
        params:
          common.isDefined(x.params) && x.params.length > 0
            ? x.params
            : undefined,
        formula: common.isDefined(x.formula) ? x.formula : undefined,
        show_chart:
          common.isDefined(x.showChart) &&
          x.showChart !== common.REP_ROW_DEFAULT_SHOW_CHART
            ? x.showChart
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
            : x.currencySuffix
      };

      return row;
    })
  });

  return repFileText;
}
