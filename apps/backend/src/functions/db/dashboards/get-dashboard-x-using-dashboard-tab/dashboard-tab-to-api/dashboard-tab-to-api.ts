import type { DashboardTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeDashboardFiltersX } from '#backend/functions/db/dashboards/get-dashboard-x-using-dashboard-tab/dashboard-tab-to-api/make-dashboard-filters-x/make-dashboard-filters-x';
import { makeTilesX } from '#backend/functions/make-tiles-x/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { FilterX } from '#common/types/backend/parts/filter/filter-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { Query } from '#common/types/blockml/parts/query/query';

export function dashboardTabToApi(item: {
  dashboard: DashboardTab;
  mconfigs: MconfigX[];
  queries: Query[];
  member: Member;
  isAddMconfigAndQuery: boolean;
  models: ModelX[];
}): DashboardX {
  let { dashboard, mconfigs, queries, isAddMconfigAndQuery, member, models } =
    item;

  let filePathArray: string[] = dashboard.filePath.split('/');

  let usersFolderIndex: number = filePathArray.findIndex(
    x => x === MPROVE_USERS_FOLDER
  );

  let author =
    usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
      ? filePathArray[usersFolderIndex + 1]
      : undefined;

  let canEditOrDeleteDashboard =
    member.isEditor || member.isAdmin || author === member.alias;

  let dashboardExtendedFilters: FilterX[] = makeDashboardFiltersX({
    dashboard: dashboard
  });

  let storeModelIds: string[] = dashboard.fields
    .filter(x => isDefined(x.storeModel))
    .map(x => x.storeModel);

  let dashboardX: DashboardX = {
    structId: dashboard.structId,
    dashboardId: dashboard.dashboardId,
    draft: dashboard.draft,
    creatorId: dashboard.creatorId,
    author: author,
    canEditOrDeleteDashboard: canEditOrDeleteDashboard,
    filePath: dashboard.filePath,
    space: dashboard.space,
    content: dashboard.content,
    accessRoles: dashboard.accessRoles,
    accessRolesCombined: dashboard.accessRolesCombined,
    title: dashboard.title,
    fields: dashboard.fields.sort((a, b) => {
      let labelA: string = a.label.toUpperCase();

      let labelB: string = b.label.toUpperCase();

      return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
    }),
    extendedFilters: dashboardExtendedFilters.sort((a, b) => {
      let labelA: string = a.fieldId.toUpperCase();

      let labelB: string = b.fieldId.toUpperCase();

      return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
    }),
    tiles: makeTilesX({
      tiles: dashboard.tiles,
      mconfigs: mconfigs,
      queries: queries,
      isAddMconfigAndQuery: isAddMconfigAndQuery,
      models: models,
      dashboardExtendedFilters: dashboardExtendedFilters
    }),
    storeModels:
      storeModelIds.length > 0
        ? models.filter(model => storeModelIds.indexOf(model.modelId) > -1)
        : [],
    serverTs: dashboard.serverTs
  };

  return dashboardX;
}
