import { Injectable } from '@nestjs/common';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapDashboardService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToApiDashboard(item: {
    dashboard: DashboardEnt;
    mconfigs: MconfigX[];
    queries: Query[];
    member: Member;
    isAddMconfigAndQuery: boolean;
    models: ModelX[];
  }): DashboardX {
    let { dashboard, mconfigs, queries, isAddMconfigAndQuery, member, models } =
      item;

    let dashboardTab = this.tabService.decrypt<DashboardTab>({
      encryptedString: dashboard.tab
    });

    let filePathArray = dashboardTab.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    let author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;

    let canEditOrDeleteDashboard =
      member.isEditor || member.isAdmin || author === member.alias;

    let dashboardExtendedFilters = makeDashboardFiltersX(dashboard);

    let storeModelIds = dashboardTab.fields
      .filter(x => isDefined(x.storeModel))
      .map(x => x.storeModel);

    let apiDashboard: DashboardX = {
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      author: author,
      canEditOrDeleteDashboard: canEditOrDeleteDashboard,
      filePath: dashboardTab.filePath,
      content: dashboardTab.content,
      accessRoles: dashboardTab.accessRoles,
      title: dashboardTab.title,
      fields: dashboardTab.fields.sort((a, b) => {
        let labelA = a.label.toUpperCase();
        let labelB = b.label.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      extendedFilters: dashboardExtendedFilters.sort((a, b) => {
        let labelA = a.fieldId.toUpperCase();
        let labelB = b.fieldId.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      tiles: makeTilesX({
        tiles: dashboardTab.tiles,
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

    return apiDashboard;
  }

  wrapToEntityDashboard(item: { dashboard: Dashboard }): DashboardEnt {
    let { dashboard } = item;

    let dashboardTab: DashboardTab = {
      filePath: dashboard.filePath,
      content: dashboard.content,
      accessRoles: dashboard.accessRoles,
      title: dashboard.title,
      fields: dashboard.fields,
      tiles: dashboard.tiles
    };

    let dashboardEnt: DashboardEnt = {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: dashboard.structId,
        dashboardId: dashboard.dashboardId
      }),
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      tab: this.tabService.encrypt({ data: dashboardTab }),
      serverTs: dashboard.serverTs
    };

    return dashboardEnt;
  }
}
