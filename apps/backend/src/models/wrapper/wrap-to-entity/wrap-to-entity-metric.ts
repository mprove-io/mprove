import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToEntityMetric(item: {
  metric: common.MetricAny;
  metricFullId?: string;
}): schemaPostgres.MetricEnt {
  let { metric, metricFullId } = item;

  return {
    metricFullId: metricFullId || common.makeId(),
    structId: metric.structId,
    type: metric.type,
    filePath: metric.filePath,
    metricId: metric.metricId,
    partId: metric.partId,
    topNode: metric.topNode,
    topLabel: metric.topLabel,
    params: metric.params,
    modelId: metric.modelId,
    fieldId: metric.fieldId,
    fieldClass: metric.fieldClass,
    timefieldId: metric.timeFieldId,
    // api_id: metric.apiId,
    formula: metric.formula,
    sql: metric.sql,
    connectionId: metric.connection,
    label: metric.label,
    partNodeLabel: metric.partNodeLabel,
    partFieldLabel: metric.partFieldLabel,
    partLabel: metric.partLabel,
    timeNodeLabel: metric.timeNodeLabel,
    timeFieldLabel: metric.timeFieldLabel,
    timeLabel: metric.timeLabel,
    description: metric.description,
    formatNumber: metric.formatNumber,
    currencyPrefix: metric.currencyPrefix,
    currencySuffix: metric.currencySuffix,
    serverTs: metric.serverTs
  };
}
