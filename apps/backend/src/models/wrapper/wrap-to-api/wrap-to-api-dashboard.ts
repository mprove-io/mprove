import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { makeDashboardFiltersX } from '~backend/functions/make-dashboard-filters-x';
import { makeTilesX } from '~backend/functions/make-tiles-x';

export function wrapToApiDashboard(item: {
  dashboard: schemaPostgres.DashboardEnt;
  mconfigs: common.MconfigX[];
  queries: common.Query[];
  member: common.Member;
  isAddMconfigAndQuery: boolean;
  models: common.ModelX[];
}): common.DashboardX {
  let { dashboard, mconfigs, queries, isAddMconfigAndQuery, member, models } =
    item;

  let filePathArray = dashboard.filePath.split('/');

  let usersFolderIndex = filePathArray.findIndex(
    x => x === common.MPROVE_USERS_FOLDER
  );

  let author =
    usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
      ? filePathArray[usersFolderIndex + 1]
      : undefined;

  let canEditOrDeleteDashboard =
    member.isEditor || member.isAdmin || author === member.alias;

  let dashboardExtendedFilters = makeDashboardFiltersX(dashboard);

  return {
    structId: dashboard.structId,
    dashboardId: dashboard.dashboardId,
    author: author,
    canEditOrDeleteDashboard: canEditOrDeleteDashboard,
    filePath: dashboard.filePath,
    content: dashboard.content,
    accessUsers: dashboard.accessUsers,
    accessRoles: dashboard.accessRoles,
    title: dashboard.title,
    gr: dashboard.gr,
    hidden: dashboard.hidden,
    fields: dashboard.fields,
    extendedFilters: dashboardExtendedFilters,
    description: dashboard.description,
    tiles: makeTilesX({
      tiles: dashboard.tiles,
      mconfigs: mconfigs,
      queries: queries,
      isAddMconfigAndQuery: isAddMconfigAndQuery,
      models: models,
      dashboardExtendedFilters: dashboardExtendedFilters
    }),
    temp: dashboard.temp,
    serverTs: dashboard.serverTs
  };
}
