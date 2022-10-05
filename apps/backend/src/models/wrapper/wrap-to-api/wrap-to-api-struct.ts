import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiStruct(struct: entities.StructEntity): common.Struct {
  return {
    projectId: struct.project_id,
    structId: struct.struct_id,
    mproveDirValue: struct.mprove_dir_value,
    weekStart: struct.week_start,
    allowTimezones: common.enumToBoolean(struct.allow_timezones),
    defaultTimezone: struct.default_timezone,
    formatNumber: struct.format_number,
    currencyPrefix: struct.currency_prefix,
    currencySuffix: struct.currency_suffix,
    errors: struct.errors,
    views: struct.views,
    udfsDict: struct.udfs_dict,
    serverTs: Number(struct.server_ts)
  };
}
