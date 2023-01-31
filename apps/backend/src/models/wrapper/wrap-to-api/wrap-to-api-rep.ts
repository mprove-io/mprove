import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiRep(item: {
  rep: entities.RepEntity;
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
  timeColumnsLimit: number;
  columns: common.Column[];
  timeColumnsLength: number;
  isTimeColumnsLimitExceeded: boolean;
}): common.Rep {
  let {
    rep,
    columns,
    timezone,
    timeSpec,
    timeRangeFraction,
    timeColumnsLimit,
    timeColumnsLength,
    isTimeColumnsLimitExceeded
  } = item;

  return {
    projectId: rep.project_id,
    structId: rep.struct_id,
    repId: rep.rep_id,
    draft: common.enumToBoolean(rep.draft),
    creatorId: rep.creator_id,
    filePath: rep.file_path,
    accessUsers: rep.access_users,
    accessRoles: rep.access_roles,
    title: rep.title,
    timezone: timezone,
    timeSpec: timeSpec,
    timeRangeFraction: timeRangeFraction,
    rows: rep.rows,
    columns: columns,
    timeColumnsLimit: timeColumnsLimit,
    timeColumnsLength: timeColumnsLength,
    isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded,
    serverTs: Number(rep.server_ts)
  };
}
