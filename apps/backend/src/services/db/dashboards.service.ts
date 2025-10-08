import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import {
  DashboardEnt,
  dashboardsTable
} from '~backend/drizzle/postgres/schema/dashboards';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import {
  DashboardLt,
  DashboardSt,
  DashboardTab
} from '~backend/drizzle/postgres/tabs/dashboard-tab';
import { MemberTab } from '~backend/drizzle/postgres/tabs/member-tab';
import { checkAccess } from '~backend/functions/check-access';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { makeDashboardFiltersX } from '~backend/functions/make-dashboard-filters-x';
import { makeTilesX } from '~backend/functions/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { Dashboard } from '~common/interfaces/blockml/dashboard';
import { Query } from '~common/interfaces/blockml/query';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';
import { MconfigsService } from './mconfigs.service';
import { MembersService } from './members.service';
import { ModelsService } from './models.service';
import { QueriesService } from './queries.service';

@Injectable()
export class DashboardsService {
  constructor(
    private tabService: TabService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private membersService: MembersService,
    private queriesService: QueriesService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
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
      // ...dashboard,
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

  async getDashboardTabCheckExists(item: {
    dashboardId: string;
    structId: string;
  }): Promise<DashboardTab> {
    let { dashboardId, structId } = item;

    let dashboard = await this.db.drizzle.query.dashboardsTable.findFirst({
      where: and(
        eq(dashboardsTable.structId, structId),
        eq(dashboardsTable.dashboardId, dashboardId)
      )
    });

    if (isUndefined(dashboard)) {
      throw new ServerError({
        message: ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST
      });
    }

    let dashboardTab = this.entToTab(dashboard);

    return dashboardTab;
  }

  checkDashboardPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_DASHBOARD_PATH
      });
    }
  }

  async getDashboardXCheckAccess(item: {
    projectId: string;
    dashboard: DashboardTab;
    userMember: MemberTab;
    bridge: BridgeEnt;
  }): Promise<DashboardX> {
    let { projectId, dashboard, userMember, bridge } = item;

    let isAccessGranted = checkAccess({
      member: userMember,
      accessRoles: dashboard.st.accessRoles
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let mconfigIds = dashboard.st.tiles.map(x => x.mconfigId);

    let mconfigs =
      mconfigIds.length === 0
        ? []
        : await this.db.drizzle.query.mconfigsTable.findMany({
            where: inArray(mconfigsTable.mconfigId, mconfigIds)
          });

    let queryIds = dashboard.st.tiles.map(x => x.queryId);
    let queries =
      queryIds.length === 0
        ? []
        : await this.db.drizzle.query.queriesTable.findMany({
            where: and(
              inArray(queriesTable.queryId, queryIds),
              eq(queriesTable.projectId, projectId)
            )
          });

    let models = await this.db.drizzle.query.modelsTable.findMany({
      where: eq(modelsTable.structId, bridge.structId)
    });

    let modelTabs = models.map(x => this.modelsService.entToTab(x));

    let apiModels = modelTabs.map(modelTab =>
      this.modelsService.tabToApi({
        model: modelTab,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: modelTab.st.accessRoles
        })
      })
    );

    let dashboardX = this.tabToApi({
      dashboard: dashboard,
      mconfigs: mconfigs
        .map(x => this.mconfigsService.entToTab(x))
        .map(x =>
          this.mconfigsService.tabToApi({
            mconfig: x,
            modelFields: apiModels.find(m => m.modelId === x.modelId).fields
          })
        ),
      queries: queries
        .map(x => this.queriesService.entToTab(x))
        .map(x => this.queriesService.tabToApi({ query: x })),
      member: this.membersService.tabToApi({ member: userMember }),
      models: apiModels,
      isAddMconfigAndQuery: true
    });

    return dashboardX;
  }

  async getDashboardParts(item: {
    structId: string;
    user: UserEnt;
    userMember: MemberTab;
    newDashboard: Dashboard;
  }): Promise<any> {
    let { structId, user, userMember, newDashboard } = item;

    let dashboardParts = (await this.db.drizzle
      .select({
        dashboardId: dashboardsTable.dashboardId,
        draft: dashboardsTable.draft,
        creatorId: dashboardsTable.creatorId,
        st: dashboardsTable.st
        // filePath: dashboardsTable.filePath,
        // accessRoles: dashboardsTable.accessRoles,
        // title: dashboardsTable.title,
        // fields: dashboardsTable.fields,
        // tiles: dashboardsTable.tiles
      })
      .from(dashboardsTable)
      .where(
        and(
          eq(dashboardsTable.dashboardId, newDashboard.dashboardId),
          eq(dashboardsTable.structId, structId),
          newDashboard.draft === true
            ? eq(dashboardsTable.creatorId, user.userId)
            : eq(dashboardsTable.draft, false)
        )
      )) as DashboardEnt[];

    let dashboardTabParts = dashboardParts.map(x => this.entToTab(x));

    let dashboardPartsGrantedAccess = dashboardTabParts.filter(x =>
      checkAccess({
        member: userMember,
        accessRoles: x.st.accessRoles
      })
    );

    let modelIdsWithDuplicates = newDashboard.tiles.map(tile => tile.modelId);
    let uniqueModelIds = [...new Set(modelIdsWithDuplicates)];

    let models = (await this.db.drizzle
      .select({
        modelId: modelsTable.modelId,
        connectionId: modelsTable.connectionId,
        connectionType: modelsTable.connectionType,
        st: modelsTable.st
        // accessRoles: modelsTable.accessRoles,
      })
      .from(modelsTable)
      .where(
        and(
          eq(modelsTable.structId, structId),
          inArray(modelsTable.modelId, uniqueModelIds)
        )
      )) as ModelEnt[];

    let modelTabs = models.map(x => this.modelsService.entToTab(x));

    let apiModels = modelTabs.map(modelTab =>
      this.modelsService.tabToApi({
        model: modelTab,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: modelTab.st.accessRoles
        })
      })
    );

    let newDashboardParts = dashboardPartsGrantedAccess.map(x =>
      this.tabToApi({
        dashboard: x,
        mconfigs: [],
        queries: [],
        member: this.membersService.tabToApi({ member: userMember }),
        models: apiModels,
        isAddMconfigAndQuery: false
      })
    );

    return newDashboardParts;
  }
}
