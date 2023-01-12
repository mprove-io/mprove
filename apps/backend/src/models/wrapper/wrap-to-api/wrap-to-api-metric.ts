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
    metricId: metric.metric_id,
    // hasAccess: hasAccess,
    type: metric.type,
    fixedParameters: metric.fixed_parameters,
    modelId: metric.model_id,
    // accessUsers: metric.access_users,
    // accessRoles: metric.access_roles,
    fieldId: metric.field_id,
    timeFieldId: metric.timefield_id,
    apiId: metric.api_id,
    timeSpec: metric.timespec,
    entries: metric.entries,
    formula: metric.formula,
    sql: metric.sql,
    connection: metric.connection_id,
    label: metric.label,
    hidden: common.enumToBoolean(metric.hidden),
    description: metric.description,
    serverTs: Number(metric.server_ts)
  };
}
