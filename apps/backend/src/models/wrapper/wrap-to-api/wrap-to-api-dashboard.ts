import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { makeFiltersX } from '~backend/functions/make-filters-x';
import { makeReportsX } from '~backend/functions/make-reports-x';

export function wrapToApiDashboard(item: {
  dashboard: entities.DashboardEntity;
  mconfigs: common.Mconfig[];
  queries: common.Query[];
  member: common.Member;
  isAddMconfigAndQuery: boolean;
  models: common.ModelX[];
}): common.DashboardX {
  let {
    dashboard,
    mconfigs,
    queries,
    isAddMconfigAndQuery,
    member,
    models
  } = item;

  let filePathArray = dashboard.file_path.split('/');

  let author =
    filePathArray.length > 1 && filePathArray[1] === common.FILES_USERS_FOLDER
      ? filePathArray[2]
      : undefined;

  let canEditOrDeleteDashboard =
    member.isEditor || member.isAdmin || author === member.alias;

  return {
    structId: dashboard.struct_id,
    dashboardId: dashboard.dashboard_id,
    author: author,
    canEditOrDeleteDashboard: canEditOrDeleteDashboard,
    filePath: dashboard.file_path,
    content: dashboard.content,
    accessUsers: dashboard.access_users,
    accessRoles: dashboard.access_roles,
    title: dashboard.title,
    gr: dashboard.gr,
    hidden: common.enumToBoolean(dashboard.hidden),
    fields: dashboard.fields,
    extendedFilters: makeFiltersX(dashboard),
    description: dashboard.description,
    reports: makeReportsX({
      reports: dashboard.reports,
      mconfigs: mconfigs,
      queries: queries,
      isAddMconfigAndQuery: isAddMconfigAndQuery,
      models: models
    }),
    temp: common.enumToBoolean(dashboard.temp),
    serverTs: Number(dashboard.server_ts)
  };
}
