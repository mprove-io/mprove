import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  DashboardTab,
  MconfigTab,
  MemberTab,
  ProjectTab,
  QueryTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type DashboardEnt,
  dashboardsTable
} from '#backend/drizzle/postgres/schema/dashboards';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { makeTilesX } from '#backend/functions/make-tiles-x/make-tiles-x';
import { makeDashboardFiltersX } from '#backend/services/db/dashboards/make-dashboard-filters-x/make-dashboard-filters-x';
import { FavoritesService } from '#backend/services/db/favorites/favorites.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { HashService } from '#backend/services/hash/hash.service';
import { SpaceService } from '#backend/services/space/space.service';
import { TabService } from '#backend/services/tab/tab.service';
import { UnitsService } from '#backend/services/units/units.service';
import { ServerError } from '#common/classes/server-error/server-error';
import {
  EMPTY_QUERY_ID,
  MPROVE_USERS_FOLDER,
  MY_DASHBOARDS_SPACE_TITLE
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetDashboardCheckExistsAndAccessResultError } from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-result-error';
import type { DashboardPart } from '#common/types/backend/parts/dashboard/dashboard-part';
import type { DashboardUnit } from '#common/types/backend/parts/dashboard/dashboard-unit';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Space } from '#common/types/blockml/parts/space';

@Injectable()
export class DashboardsService {
  constructor(
    private tabService: TabService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private hashService: HashService,
    private favoritesService: FavoritesService,
    private spaceService: SpaceService,
    private unitsService: UnitsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getDashboardsCatalog(item: {
    projectId: string;
    structId: string;
    user: UserTab;
    apiUserMember: Member;
    spaces: Space[];
  }): Promise<{
    dashboardUnitDrafts: DashboardUnit[];
    dashboardSpaceNodes: SpaceNode[];
  }> {
    let { projectId, structId, user, apiUserMember, spaces } = item;

    let dashboards = await this.db.drizzle.query.dashboardsTable
      .findMany({
        where: and(
          eq(dashboardsTable.structId, structId),
          or(
            eq(dashboardsTable.draft, false),
            and(
              eq(dashboardsTable.draft, true),
              eq(dashboardsTable.creatorId, user.userId)
            )
          )
        )
      })
      .then(xs => xs.map(x => this.tabService.dashboardEntToTab(x)));

    let dashboardTabsGrantedAccess = dashboards.filter(dashboard => {
      if (dashboard.draft === true) {
        return true;
      }

      return checkAccess({
        member: apiUserMember,
        accessRoles: dashboard.accessRolesCombined,
        filePath: dashboard.filePath
      });
    });

    let draftDashboards = dashboardTabsGrantedAccess.filter(
      dashboard => dashboard.draft === true
    );

    let savedDashboards = dashboardTabsGrantedAccess.filter(
      dashboard => dashboard.draft === false
    );

    let dashboardTargetIds = savedDashboards.map(
      dashboard => dashboard.dashboardId
    );

    let favoriteDashboardIds = await this.favoritesService.getFavoriteTargetIds(
      {
        projectId: projectId,
        userId: user.userId,
        type: 'Dashboard',
        targetIds: dashboardTargetIds
      }
    );

    let dashboardSpaceUnits = savedDashboards.map(dashboard =>
      this.unitsService.makeDashboardSpaceUnit({
        dashboard: dashboard,
        member: apiUserMember,
        favoriteDashboardIds: favoriteDashboardIds
      })
    );

    return {
      dashboardUnitDrafts: draftDashboards.map(dashboard =>
        this.unitsService.makeDashboardUnit({
          dashboard: dashboard,
          member: apiUserMember,
          favoriteDashboardIds: [],
          space: dashboard.space,
          spaceFullTitle: dashboard.space
            ? spaces.find(space => space.space === dashboard.space)?.fullTitle
            : ''
        })
      ),
      dashboardSpaceNodes: this.spaceService.makeSpaceNodes({
        spaces: spaces ?? [],
        units: dashboardSpaceUnits,
        member: apiUserMember,
        mySpaceTitle: MY_DASHBOARDS_SPACE_TITLE
      })
    };
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
      space: dashboard.space,
      content: dashboard.content,
      accessRoles: dashboard.accessRoles,
      accessRolesCombined: dashboard.accessRolesCombined,
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
      space: dashboard.space,
      accessRoles: dashboard.accessRoles,
      accessRolesCombined: dashboard.accessRolesCombined,
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
      space: apiDashboard.space,
      accessRoles: apiDashboard.accessRoles,
      accessRolesCombined: apiDashboard.accessRolesCombined,
      title: apiDashboard.title,
      fields: apiDashboard.fields,
      tiles: apiDashboard.tiles,
      content: apiDashboard.content,
      keyTag: undefined,
      serverTs: apiDashboard.serverTs
    };

    return dashboard;
  }

  async getDashboardCheckExistsAndAccess(item: {
    dashboardId: string;
    structId: string;
    userMember: MemberTab | Member;
    user: UserTab;
  }): Promise<DashboardTab> {
    let result: Result.Result<
      DashboardTab,
      GetDashboardCheckExistsAndAccessResultError
    > = await this.getDashboardCheckExistsAndAccessResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let dashboard: DashboardTab = result.value;

    return dashboard;
  }

  async getDashboardCheckExistsAndAccessResult(item: {
    dashboardId: string;
    structId: string;
    userMember: MemberTab | Member;
    user: UserTab;
  }): Result.ResultAsync<
    DashboardTab,
    GetDashboardCheckExistsAndAccessResultError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'dashboard',
        (
          v
        ): Result.ResultAsync<
          DashboardTab,
          GetDashboardCheckExistsAndAccessResultError
        > =>
          this.db.drizzle.query.dashboardsTable
            .findFirst({
              where: and(
                eq(dashboardsTable.structId, v.structId),
                eq(dashboardsTable.dashboardId, v.dashboardId)
              )
            })
            .then(dashboardEnt =>
              isUndefined(dashboardEnt)
                ? Result.fail({ code: 'BACKEND_DASHBOARD_DOES_NOT_EXIST' })
                : this.tabService.dashboardEntToTabResult({
                    dashboardEnt: dashboardEnt
                  })
            )
      ),
      Result.andThrough(v => {
        if (
          v.dashboard.draft === true &&
          v.dashboard.creatorId !== v.user.userId
        ) {
          return Result.fail({ code: 'BACKEND_DASHBOARD_CREATOR_ID_MISMATCH' });
        }

        return Result.succeed();
      }),
      Result.andThrough(v => {
        if (v.dashboard.draft === false) {
          let isAccessGranted: boolean = checkAccess({
            member: v.userMember,
            accessRoles: v.dashboard.accessRolesCombined,
            filePath: v.dashboard.filePath
          });

          if (isAccessGranted === false) {
            return Result.fail({ code: 'BACKEND_FORBIDDEN_DASHBOARD' });
          }
        }

        return Result.succeed();
      }),
      Result.map((v): DashboardTab => v.dashboard)
    );
  }

  async getDashboardXCheckExistsAndAccess(item: {
    dashboardId: string;
    structId: string;
    projectId: string;
    user: UserTab;
    apiUserMember: Member; // do not use membersService inside dashboardsService (circular dep with blockmlService)
  }): Promise<DashboardX> {
    let { projectId, dashboardId, structId, apiUserMember, user } = item;

    let dashboard = await this.getDashboardCheckExistsAndAccess({
      structId: structId,
      dashboardId: dashboardId,
      userMember: apiUserMember,
      user: user
    });

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
          modelAccessRoles: model.accessRolesCombined
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

    let dashboardPartsGrantedAccess = dashboardParts.filter(x => {
      if (x.draft === true) {
        return true;
      }

      return checkAccess({
        member: apiUserMember,
        accessRoles: x.accessRolesCombined,
        filePath: x.filePath
      });
    });

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

    let dashboardPartsGrantedAccess = dashboardParts.filter(x => {
      if (x.draft === true) {
        return true;
      }

      return checkAccess({
        member: apiUserMember,
        accessRoles: x.accessRolesCombined,
        filePath: x.filePath
      });
    });

    let apiDashboardParts = dashboardPartsGrantedAccess.map(x =>
      this.tabToDashboardPart({
        dashboard: x,
        member: apiUserMember
      })
    );

    return apiDashboardParts;
  }

  async processDashboard(item: {
    newApiDashboard: Dashboard;
    apiMconfigs: Mconfig[];
    apiQueries: Query[];
    apiModels: Model[];
    fromDashboardX: DashboardX;
    isQueryCache: boolean;
    cachedMconfigs: MconfigTab[];
    cachedQueries: QueryTab[];
    envId: string;
    newDashboardId: string;
    tempStruct: StructTab;
    project: ProjectTab;
  }) {
    let {
      newApiDashboard,
      apiMconfigs,
      apiQueries,
      apiModels,
      fromDashboardX,
      isQueryCache,
      cachedQueries,
      cachedMconfigs,
      envId,
      newDashboardId,
      tempStruct,
      project
    } = item;

    let dashboardMconfigIds = newApiDashboard.tiles.map(x => x.mconfigId);
    let dashboardMconfigs = apiMconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = newApiDashboard.tiles.map(x => x.queryId);
    let dashboardQueries = apiQueries
      .filter(x => dashboardQueryIds.indexOf(x.queryId) > -1)
      .map(x => this.queriesService.apiToTab({ apiQuery: x }));

    let insertMconfigs: MconfigTab[] = [];
    let insertOrUpdateQueries: QueryTab[] = [];
    let insertOrDoNothingQueries: QueryTab[] = [];

    let dashboardMalloyMconfigs = dashboardMconfigs.filter(
      mconfig => mconfig.modelType === 'Malloy'
    );

    let dashboardMalloyQueries: QueryTab[] = [];

    dashboardMalloyMconfigs.forEach(apiMconfig => {
      let mconfig = this.mconfigsService.apiToTab({ apiMconfig: apiMconfig });

      insertMconfigs.push(mconfig);

      let query = dashboardQueries.find(x => x.queryId === mconfig.queryId);

      if (
        dashboardMalloyQueries.map(x => x.queryId).indexOf(query.queryId) < 0
      ) {
        dashboardMalloyQueries.push(query);
      }
    });

    let dashboardStoreMconfigs = dashboardMconfigs.filter(
      mconfig => mconfig.modelType === 'Store'
    );

    let storeQueries: QueryTab[] = [];

    await forEachSeries(dashboardStoreMconfigs, async apiMconfig => {
      let newMconfig: MconfigTab;
      let newQuery: QueryTab;
      let isError = false;

      let apiModel = apiModels.find(y => y.modelId === apiMconfig.modelId);

      let mqe = await this.mconfigsService.prepStoreMconfigQuery({
        struct: tempStruct,
        project: project,
        envId: envId,
        mconfigParentType: 'Dashboard',
        mconfigParentId: newDashboardId,
        model: this.modelsService.apiToTab({ apiModel: apiModel }),
        mconfig: this.mconfigsService.apiToTab({ apiMconfig: apiMconfig }),
        metricsStartDateYYYYMMDD: undefined,
        metricsEndDateYYYYMMDD: undefined
      });

      newMconfig = mqe.newMconfig;
      newQuery = mqe.newQuery;
      isError = mqe.isError;

      let newDashboardTile = newApiDashboard.tiles.find(
        tile => tile.mconfigId === apiMconfig.mconfigId
      );
      newDashboardTile.queryId = newMconfig.queryId;
      newDashboardTile.mconfigId = newMconfig.mconfigId;
      newDashboardTile.trackChangeId = makeId();

      insertMconfigs.push(newMconfig);
      storeQueries.push(newQuery);
    });

    let combinedQueries = [...dashboardMalloyQueries, ...storeQueries];

    insertMconfigs.forEach(mconfig => {
      let query = combinedQueries.find(y => y.queryId === mconfig.queryId);

      // prev query and new query has different queryId (different parent dashboardId)
      let prevTile = fromDashboardX.tiles.find(
        y => y.title === mconfig.chart.title
      );

      let prevQuery = prevTile?.query;

      if (
        isQueryCache === true &&
        query.status !== 'Error' &&
        isDefined(prevQuery) &&
        prevQuery.status === 'Completed'
      ) {
        query.data = prevQuery.data;
        query.status = prevQuery.status;
        query.lastCompleteTs = prevQuery.lastCompleteTs;
        query.lastCompleteDuration = prevQuery.lastCompleteDuration;

        insertOrUpdateQueries.push(query);
      } else if (
        isQueryCache === true &&
        query.status !== 'Error' &&
        prevTile.queryId === EMPTY_QUERY_ID &&
        cachedQueries.length > 0
      ) {
        let cachedMconfig = cachedMconfigs.find(
          x => x.chart.title === mconfig.chart.title
        );

        let cachedQuery = cachedQueries.find(
          x => x.queryId === cachedMconfig.queryId
        );

        if (cachedQuery.status === 'Completed') {
          query.data = cachedQuery.data;
          query.status = cachedQuery.status;
          query.lastCompleteTs = cachedQuery.lastCompleteTs;
          query.lastCompleteDuration = cachedQuery.lastCompleteDuration;

          insertOrUpdateQueries.push(query);
        } else {
          insertOrDoNothingQueries.push(query);
        }
      } else {
        insertOrDoNothingQueries.push(query);
      }
    });

    let newDashboard = this.apiToTab({
      apiDashboard: newApiDashboard
    });

    return {
      newDashboard: newDashboard,
      insertMconfigs: insertMconfigs,
      insertOrUpdateQueries: insertOrUpdateQueries,
      insertOrDoNothingQueries: insertOrDoNothingQueries
    };
  }
}
