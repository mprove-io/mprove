import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiMetric(item: {
  metric: entities.MetricEntity;
  // hasAccess: boolean;
}): common.MetricAny {
  let {
    metric
    // , hasAccess
  } = item;

  return {
    structId: metric.struct_id,
    type: metric.type,
    filePath: metric.file_path,
    metricId: metric.metric_id,
    partId: metric.part_id,
    topNode: metric.top_node,
    topLabel: metric.top_label,
    // hasAccess: hasAccess,
    params: metric.params,
    modelId: metric.model_id,
    // accessUsers: metric.access_users,
    // accessRoles: metric.access_roles,
    fieldId: metric.field_id,
    fieldClass: metric.field_class,
    timeFieldId: metric.timefield_id,
    apiId: metric.api_id,
    formula: metric.formula,
    sql: metric.sql,
    connection: metric.connection_id,
    label: metric.label,
    partNodeLabel: metric.part_node_label,
    partFieldLabel: metric.part_field_label,
    partLabel: metric.part_label,
    timeNodeLabel: metric.time_node_label,
    timeFieldLabel: metric.time_field_label,
    timeLabel: metric.time_label,
    description: metric.description,
    formatNumber: metric.format_number,
    currencyPrefix: metric.currency_prefix,
    currencySuffix: metric.currency_suffix,
    serverTs: Number(metric.server_ts)
  };
}
