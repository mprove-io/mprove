import { Injectable } from '@nestjs/common';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
import {
  DashboardLt,
  DashboardSt,
  DashboardTab
} from '~backend/drizzle/postgres/tabs/dashboard-tab';
import { makeDashboardFiltersX } from '~backend/functions/make-dashboard-filters-x';
import { makeTilesX } from '~backend/functions/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { isDefined } from '~common/functions/is-defined';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Dashboard } from '~common/interfaces/blockml/dashboard';
import { Query } from '~common/interfaces/blockml/query';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapDashboardService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  tabToApi(item: {
    dashboard: DashboardTab;
    mconfigs: MconfigX[];
    queries: Query[];
    member: Member;
    isAddMconfigAndQuery: boolean;
    models: ModelX[];
  }): DashboardX {
    let { dashboard, mconfigs, queries, isAddMconfigAndQuery, member, models } =
      item;

    let filePathArray = dashboard.st.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    let author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;

    let canEditOrDeleteDashboard =
      member.isEditor || member.isAdmin || author === member.alias;

    let dashboardExtendedFilters = makeDashboardFiltersX({
      dashboard: dashboard
    });

    let storeModelIds = dashboard.st.fields
      .filter(x => isDefined(x.storeModel))
      .map(x => x.storeModel);

    let dashboardX: DashboardX = {
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      author: author,
      canEditOrDeleteDashboard: canEditOrDeleteDashboard,
      filePath: dashboard.st.filePath,
      content: dashboard.lt.content,
      accessRoles: dashboard.st.accessRoles,
      title: dashboard.st.title,
      fields: dashboard.st.fields.sort((a, b) => {
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
        tiles: dashboard.st.tiles,
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

  apiToTab(item: { dashboard: Dashboard }): DashboardTab {
    let { dashboard } = item;

    let dashboardSt: DashboardSt = {
      filePath: dashboard.filePath,
      accessRoles: dashboard.accessRoles,
      title: dashboard.title,
      fields: dashboard.fields,
      tiles: dashboard.tiles
    };

    let dashboardLt: DashboardLt = {
      content: dashboard.content
    };

    let dashboardTab: DashboardTab = {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: dashboard.structId,
        dashboardId: dashboard.dashboardId
      }),
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      st: dashboardSt,
      lt: dashboardLt,
      serverTs: dashboard.serverTs
    };

    return dashboardTab;
  }

  tabToEnt(dashboard: DashboardTab): DashboardEnt {
    let dashboardEnt: DashboardEnt = {
      ...dashboard,
      st: this.tabService.encrypt({ data: dashboard.st }),
      lt: this.tabService.encrypt({ data: dashboard.lt })
    };

    return dashboardEnt;
  }

  entToTab(dashboard: DashboardEnt): DashboardTab {
    let dashboardTab: DashboardTab = {
      ...dashboard,
      st: this.tabService.decrypt<DashboardSt>({
        encryptedString: dashboard.st
      }),
      lt: this.tabService.decrypt<DashboardLt>({
        encryptedString: dashboard.lt
      })
    };

    return dashboardTab;
  }
}
