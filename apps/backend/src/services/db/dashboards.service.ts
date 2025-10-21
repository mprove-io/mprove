import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, or } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { DashboardTab, UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import {
  DashboardEnt,
  dashboardsTable
} from '~backend/drizzle/postgres/schema/dashboards';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { checkAccess } from '~backend/functions/check-access';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { makeDashboardFiltersX } from '~backend/functions/make-dashboard-filters-x';
import { makeTilesX } from '~backend/functions/make-tiles-x';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { DashboardPart } from '~common/interfaces/backend/dashboard-part';
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
import { ModelsService } from './models.service';
import { QueriesService } from './queries.service';

@Injectable()
export class DashboardsService {
  constructor(
    private tabService: TabService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
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

  tabToDashboardPart(item: {
    dashboard: DashboardTab;
    member: Member;
  }): DashboardPart {
    let { dashboard, member } = item;

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

    let dashboardPart: DashboardPart = {
      structId: dashboard.structId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      creatorId: dashboard.creatorId,
      title: dashboard.title,
      filePath: dashboard.filePath,
      accessRoles: dashboard.accessRoles,
      tiles: dashboard.tiles,
      author: author,
      canEditOrDeleteDashboard: canEditOrDeleteDashboard
    };

    return dashboardPart;
  }

  apiToTab(item: { apiDashboard: Dashboard }): DashboardTab {
    let { apiDashboard } = item;

    if (isUndefined(apiDashboard)) {
      return;
    }

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
      keyTag: undefined,
      serverTs: apiDashboard.serverTs
    };

    return dashboard;
  }

  checkDashboardPath(item: { filePath: string; userAlias: string }) {
    let filePathArray = item.filePath.split('/');

    let usersFolderIndex = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    if (
      usersFolderIndex < 0 ||
      filePathArray.length === usersFolderIndex + 1 ||
      filePathArray[usersFolderIndex + 1] !== item.userAlias
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_DASHBOARD_PATH
      });
    }
  }

  async getDashboardCheckExists(item: {
    dashboardId: string;
    structId: string;
  }): Promise<DashboardTab> {
    let { dashboardId, structId } = item;

    let dashboard = await this.db.drizzle.query.dashboardsTable
      .findFirst({
        where: and(
          eq(dashboardsTable.structId, structId),
          eq(dashboardsTable.dashboardId, dashboardId)
        )
      })
      .then(x => this.tabService.dashboardEntToTab(x));

    if (isUndefined(dashboard)) {
      throw new ServerError({
        message: ErEnum.BACKEND_DASHBOARD_DOES_NOT_EXIST
      });
    }

    return dashboard;
  }

  async getDashboardXCheckExistsAndAccess(item: {
    dashboardId: string;
    structId: string;
    projectId: string;
    apiUserMember: Member; // do not use membersService inside dashboardsService (circular dep with blockmlService)
  }): Promise<DashboardX> {
    let { projectId, dashboardId, structId, apiUserMember } = item;

    let dashboard = await this.getDashboardCheckExists({
      structId: structId,
      dashboardId: dashboardId
    });

    let isAccessGranted = checkAccess({
      member: apiUserMember,
      accessRoles: dashboard.accessRoles
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let dashboardX = this.getDashboardXUsingDashboardTab({
      dashboard: dashboard,
      structId: structId,
      projectId: projectId,
      apiUserMember: apiUserMember
    });

    return dashboardX;
  }

  async getDashboardXUsingDashboardTab(item: {
    dashboard: DashboardTab;
    structId: string;
    projectId: string;
    apiUserMember: Member; // do not use membersService inside dashboardsService (circular dep with blockmlService)
  }): Promise<DashboardX> {
    let { dashboard, structId, projectId, apiUserMember } = item;

    let mconfigIds = dashboard.tiles.map(x => x.mconfigId);

    let mconfigs =
      mconfigIds.length === 0
        ? []
        : await this.db.drizzle.query.mconfigsTable
            .findMany({
              where: inArray(mconfigsTable.mconfigId, mconfigIds)
            })
            .then(xs => xs.map(x => this.tabService.mconfigEntToTab(x)));

    let queryIds = dashboard.tiles.map(x => x.queryId);
    let queries =
      queryIds.length === 0
        ? []
        : await this.db.drizzle.query.queriesTable
            .findMany({
              where: and(
                inArray(queriesTable.queryId, queryIds),
                eq(queriesTable.projectId, projectId)
              )
            })
            .then(xs => xs.map(x => this.tabService.queryEntToTab(x)));

    let models = await this.db.drizzle.query.modelsTable
      .findMany({
        where: eq(modelsTable.structId, structId)
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let apiModels = models.map(model =>
      this.modelsService.tabToApi({
        model: model,
        hasAccess: checkModelAccess({
          member: apiUserMember,
          modelAccessRoles: model.accessRoles
        })
      })
    );

    let dashboardX = this.tabToApi({
      dashboard: dashboard,
      mconfigs: mconfigs.map(x =>
        this.mconfigsService.tabToApi({
          mconfig: x,
          modelFields: apiModels.find(m => m.modelId === x.modelId).fields
        })
      ),
      queries: queries.map(x => this.queriesService.tabToApi({ query: x })),
      member: apiUserMember,
      models: apiModels,
      isAddMconfigAndQuery: true
    });

    return dashboardX;
  }

  async getDashboardPart(item: {
    structId: string;
    user: UserTab;
    apiUserMember: Member;
    newDashboard: DashboardTab;
  }): Promise<DashboardPart> {
    let { structId, user, apiUserMember, newDashboard } = item;

    let dashboardParts = await this.db.drizzle
      .select({
        keyTag: dashboardsTable.keyTag,
        dashboardId: dashboardsTable.dashboardId,
        draft: dashboardsTable.draft,
        creatorId: dashboardsTable.creatorId,
        st: dashboardsTable.st
        // lt: {},
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
      )
      .then(xs =>
        xs.map(x => this.tabService.dashboardEntToTab(x as DashboardEnt))
      );

    let dashboardPartsGrantedAccess = dashboardParts.filter(x =>
      checkAccess({
        member: apiUserMember,
        accessRoles: x.accessRoles
      })
    );

    let newDashboardParts = dashboardPartsGrantedAccess.map(x =>
      this.tabToDashboardPart({
        dashboard: x,
        member: apiUserMember
      })
    );

    return newDashboardParts.length > 0 ? newDashboardParts[0] : undefined;
  }

  async getDashboardParts(item: {
    structId: string;
    user: UserTab;
    apiUserMember: Member;
  }): Promise<DashboardPart[]> {
    let { structId, user, apiUserMember } = item;

    let dashboardParts = await this.db.drizzle
      .select({
        keyTag: dashboardsTable.keyTag,
        dashboardId: dashboardsTable.dashboardId,
        draft: dashboardsTable.draft,
        creatorId: dashboardsTable.creatorId,
        st: dashboardsTable.st
        // lt: {},
      })
      .from(dashboardsTable)
      .where(
        and(
          eq(dashboardsTable.structId, structId),
          or(
            eq(dashboardsTable.draft, false),
            eq(dashboardsTable.creatorId, user.userId)
          )
        )
      )
      .then(xs =>
        xs.map(x => this.tabService.dashboardEntToTab(x as DashboardEnt))
      );

    let dashboardPartsGrantedAccess = dashboardParts.filter(x =>
      checkAccess({
        member: apiUserMember,
        accessRoles: x.accessRoles
      })
    );

    let apiDashboardParts = dashboardPartsGrantedAccess.map(x =>
      this.tabToDashboardPart({
        dashboard: x,
        member: apiUserMember
      })
    );

    return apiDashboardParts;
  }
}
