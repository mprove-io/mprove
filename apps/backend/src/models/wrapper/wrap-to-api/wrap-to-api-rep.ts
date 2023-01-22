import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiRep(item: {
  rep: entities.RepEntity;
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
  timeColumnsLimit: number;
  timeColumnsLength: number;
}): common.Rep {
  let {
    rep,
    timezone,
    timeSpec,
    timeRangeFraction,
    timeColumnsLimit,
    timeColumnsLength
  } = item;

  return {
    structId: rep.struct_id,
    repId: rep.rep_id,
    filePath: rep.file_path,
    title: rep.title,
    timezone: timezone,
    timeSpec: timeSpec,
    timeRangeFraction: timeRangeFraction,
    rows: rep.rows,
    columns: [],
    timeColumnsLimit: timeColumnsLimit,
    timeColumnsLength: timeColumnsLength,
    isTimeColumnsLimitReached:
      common.isDefined(timeColumnsLimit) && common.isDefined(timeColumnsLength)
        ? timeColumnsLength >= timeColumnsLimit
        : false,
    serverTs: Number(rep.server_ts)
  };
}
