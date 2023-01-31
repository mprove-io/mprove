import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiRep(item: {
  rep: entities.RepEntity;
  member: common.Member;
  timezone: string;
  timeSpec: common.TimeSpecEnum;
  timeRangeFraction: common.Fraction;
  timeColumnsLimit: number;
  columns: common.Column[];
  timeColumnsLength: number;
  isTimeColumnsLimitExceeded: boolean;
}): common.RepX {
  let {
    rep,
    member,
    columns,
    timezone,
    timeSpec,
    timeRangeFraction,
    timeColumnsLimit,
    timeColumnsLength,
    isTimeColumnsLimitExceeded
  } = item;

  let filePathArray = rep.file_path.split('/');

  let usersFolderIndex = filePathArray.findIndex(
    x => x === common.MPROVE_USERS_FOLDER
  );

  let author =
    usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
      ? filePathArray[usersFolderIndex + 1]
      : undefined;

  let canEditOrDeleteRep =
    member.isEditor || member.isAdmin || author === member.alias;

  return {
    projectId: rep.project_id,
    structId: rep.struct_id,
    repId: rep.rep_id,
    canEditOrDeleteRep: canEditOrDeleteRep,
    author: author,
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
    draftCreatedTs: Number(rep.draft_created_ts),
    serverTs: Number(rep.server_ts)
  };
}
