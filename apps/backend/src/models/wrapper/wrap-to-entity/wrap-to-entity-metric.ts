import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityMetric(x: common.MetricAny): entities.MetricEntity {
  return {
    struct_id: x.structId,
    type: x.type,
    file_path: x.filePath,
    metric_id: x.metricId,
    part_id: x.partId,
    top_node: x.topNode,
    top_label: x.topLabel,
    params: x.params,
    model_id: x.modelId,
    field_id: x.fieldId,
    field_class: x.fieldClass,
    timefield_id: x.timeFieldId,
    api_id: x.apiId,
    formula: x.formula,
    sql: x.sql,
    connection_id: x.connection,
    label: x.label,
    part_node_label: x.partNodeLabel,
    part_field_label: x.partFieldLabel,
    part_label: x.partLabel,
    time_node_label: x.timeNodeLabel,
    time_field_label: x.timeFieldLabel,
    time_label: x.timeLabel,
    description: x.description,
    format_number: x.formatNumber,
    currency_prefix: x.currencyPrefix,
    currency_suffix: x.currencySuffix,
    server_ts: x.serverTs.toString()
  };
}
