import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function makeStruct(item: {
  projectId: string;
  structId: string;
  weekStart: common.ProjectWeekStartEnum;
  allowTimezones: common.BoolEnum;
  defaultTimezone: string;
  errors: common.BmlError[];
  views: common.View[];
  udfsDict: common.UdfsDict;
}) {
  let structEntity: entities.StructEntity = {
    project_id: item.projectId,
    struct_id: item.structId,
    week_start: item.weekStart,
    allow_timezones: item.allowTimezones,
    default_timezone: item.defaultTimezone,
    errors: item.errors,
    views: item.views,
    udfs_dict: item.udfsDict,
    server_ts: undefined
  };
  return structEntity;
}
