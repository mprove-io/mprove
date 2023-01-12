import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityMetric(x: common.MetricAny): entities.MetricEntity {
  return {
    struct_id: x.structId,
    metric_id: x.metricId,
    top_node: x.topNode,
    type: x.type,
    fixed_parameters: x.fixedParameters,
    model_id: x.modelId,
    field_id: x.fieldId,
    timefield_id: x.timeFieldId,
    api_id: x.apiId,
    timespec: x.timeSpec,
    entries: x.entries,
    formula: x.formula,
    sql: x.sql,
    connection_id: x.connection,
    label: x.label,
    hidden: common.booleanToEnum(x.hidden),
    description: x.description,
    server_ts: x.serverTs.toString()
  };
}
