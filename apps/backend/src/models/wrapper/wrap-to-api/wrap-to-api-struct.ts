import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiStruct(struct: entities.StructEntity): common.Struct {
  return {
    projectId: struct.project_id,
    structId: struct.struct_id,
    weekStart: struct.week_start,
    allowTimezones: common.enumToBoolean(struct.allow_timezones),
    defaultTimezone: struct.default_timezone,
    errors: struct.errors,
    views: struct.views,
    udfsDict: struct.udfs_dict,
    serverTs: Number(struct.server_ts)
  };
}