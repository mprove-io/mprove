import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  DashboardEnt,
  dashboardsTable
} from '~backend/drizzle/postgres/schema/dashboards';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { BridgeTab } from '~backend/drizzle/postgres/tabs/bridge-tab';
import {
  DashboardLt,
  DashboardSt,
  DashboardTab
} from '~backend/drizzle/postgres/tabs/dashboard-tab';
import { MemberTab } from '~backend/drizzle/postgres/tabs/member-tab';
import { UserTab } from '~backend/drizzle/postgres/tabs/user-tab';
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

  entToTab(dashboardEnt: DashboardEnt): DashboardTab {
    if (isUndefined(dashboardEnt)) {
      return;
    }

    let dashboard: DashboardTab = {
      ...dashboardEnt,
      ...this.tabService.decrypt<DashboardSt>({
        encryptedString: dashboardEnt.st
      }),
      ...this.tabService.decrypt<DashboardLt>({
        encryptedString: dashboardEnt.lt
      })
    };

    return dashboard;
  }

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

    let filePathArray = dashboard.filePath.split('/');

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

    let storeModelIds = dashboard.fields
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
      content: dashboard.content,
      accessRoles: dashboard.accessRoles,
      title: dashboard.title,
      fields: dashboard.fields.sort((a, b) => {
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

  apiToTab(item: { apiDashboard: Dashboard }): DashboardTab {
    let { apiDashboard } = item;

    let dashboard: DashboardTab = {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: apiDashboard.structId,
        dashboardId: apiDashboard.dashboardId
      }),
      structId: apiDashboard.structId,
      dashboardId: apiDashboard.dashboardId,
      draft: apiDashboard.draft,
      creatorId: apiDashboard.creatorId,
      filePath: apiDashboard.filePath,
      accessRoles: apiDashboard.accessRoles,
      title: apiDashboard.title,
      fields: apiDashboard.fields,
      tiles: apiDashboard.tiles,
      content: apiDashboard.content,
      serverTs: apiDashboard.serverTs
    };

    return dashboard;
  }

  async getDashboardCheckExists(item: {
    dashboardId: string;
    structId: string;
  }): Promise<DashboardTab> {
    let { dashboardId, structId } = item;

    let dashboard = this.entToTab(
      await this.db.drizzle.query.dashboardsTable.findFirst({
        where: and(
          eq(dashboardsTable.structId, structId),
          eq(dashboardsTable.dashboardId, dashboardId)
        )
      })
    );

    if (isUndefined(dashboard)) {
      throw new ServerError({
        message: ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST
      });
    }

    return dashboard;
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
    bridge: BridgeTab;
  }): Promise<DashboardX> {
    let { projectId, dashboard, userMember, bridge } = item;

    let isAccessGranted = checkAccess({
      member: userMember,
      accessRoles: dashboard.accessRoles
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let mconfigIds = dashboard.tiles.map(x => x.mconfigId);

    let mconfigs =
      mconfigIds.length === 0
        ? []
        : await this.db.drizzle.query.mconfigsTable.findMany({
            where: inArray(mconfigsTable.mconfigId, mconfigIds)
          });

    let queryIds = dashboard.tiles.map(x => x.queryId);
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
          modelAccessRoles: modelTab.accessRoles
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
    user: UserTab;
    userMember: MemberTab;
    newDashboard: DashboardTab;
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
        accessRoles: x.accessRoles
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
          modelAccessRoles: modelTab.accessRoles
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
