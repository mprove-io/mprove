import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { makeReportsX } from '~backend/functions/make-reports-x';

export function wrapToApiViz(item: {
  viz: entities.VizEntity;
  mconfigs: common.MconfigX[];
  queries: common.Query[];
  member: common.Member;
  isAddMconfigAndQuery: boolean;
  models: common.ModelX[];
}): common.VizX {
  let { viz, mconfigs, queries, member, isAddMconfigAndQuery, models } = item;

  let filePathArray = viz.file_path.split('/');

  let usersFolderIndex = filePathArray.findIndex(
    x => x === common.MPROVE_USERS_FOLDER
  );

  let author =
    usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
      ? filePathArray[usersFolderIndex + 1]
      : undefined;

  let canEditOrDeleteViz =
    member.isEditor || member.isAdmin || author === member.alias;

  return {
    structId: viz.struct_id,
    vizId: viz.viz_id,
    author: author,
    canEditOrDeleteViz: canEditOrDeleteViz,
    title: viz.title,
    modelId: viz.model_id,
    modelLabel: viz.model_label,
    filePath: viz.file_path,
    accessUsers: viz.access_users,
    accessRoles: viz.access_roles,
    gr: viz.gr,
    hidden: common.enumToBoolean(viz.hidden),
    reports: makeReportsX({
      reports: viz.reports,
      mconfigs: mconfigs,
      queries: queries,
      isAddMconfigAndQuery: isAddMconfigAndQuery,
      models: models
    }),
    serverTs: Number(viz.server_ts)
  };
}
