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
    timespec: x.timeSpec,
    entries: x.entries,
    formula: x.formula,
    sql: x.sql,
    connection_id: x.connection,
    label: x.label,
    part_label: x.partLabel,
    description: x.description,
    server_ts: x.serverTs.toString()
  };
}
