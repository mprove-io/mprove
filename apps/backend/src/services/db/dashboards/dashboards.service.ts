import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import type {
  DashboardTab,
  MconfigTab,
  MemberTab,
  ModelTab,
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
import { DbService } from '#backend/services/db/db.service';
import { FavoritesService } from '#backend/services/db/favorites/favorites.service';
import type { PrepStoreMconfigQueryOutput } from '#backend/services/db/mconfigs/mconfigs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { HashService } from '#backend/services/hash/hash.service';
import { SpaceService } from '#backend/services/space/space.service';
import { TabService } from '#backend/services/tab/tab.service';
import { UnitsService } from '#backend/services/units/units.service';
import {
  EMPTY_QUERY_ID,
  MPROVE_USERS_FOLDER,
  MY_DASHBOARDS_SPACE_TITLE
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { DashboardEntToTabError } from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';
import type { GetDashboardCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-error';
import type { GetDashboardPartsError } from '#common/types/backend/function-errors/get-dashboard-parts-error';
import type { GetDashboardXCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-x-check-exists-and-access-error';
import type { GetDashboardXUsingDashboardTabError } from '#common/types/backend/function-errors/get-dashboard-x-using-dashboard-tab-error';
import type { GetDashboardsCatalogError } from '#common/types/backend/function-errors/get-dashboards-catalog-error';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { ProcessDashboardError } from '#common/types/backend/function-errors/process-dashboard-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { DashboardPart } from '#common/types/backend/parts/dashboard/dashboard-part';
import type { DashboardUnit } from '#common/types/backend/parts/dashboard/dashboard-unit';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Space } from '#common/types/blockml/parts/space';
import type { Tile } from '#common/types/blockml/parts/tile/tile';

type AssembleDashboardProjectionPayload = {
  apiModels: ModelX[];
  dashboardX: DashboardX;
};

type PrepareDashboardQueriesPayload = {
  dashboardMconfigIds: string[];
  dashboardMconfigs: Mconfig[];
  dashboardQueryIds: string[];
  dashboardQueries: QueryTab[];
  insertMconfigs: MconfigTab[];
  insertOrUpdateQueries: QueryTab[];
  insertOrDoNothingQueries: QueryTab[];
  dashboardMalloyMconfigs: Mconfig[];
  dashboardMalloyQueries: QueryTab[];
  dashboardStoreMconfigs: Mconfig[];
  storeQueries: QueryTab[];
};

type AssembleDashboardPayload = {
  combinedQueries: QueryTab[];
  newDashboard: DashboardTab;
};

export type ProcessDashboardOutput = {
  newDashboard: DashboardTab;
  insertMconfigs: MconfigTab[];
  insertOrUpdateQueries: QueryTab[];
  insertOrDoNothingQueries: QueryTab[];
};

export type DashboardsCatalog = {
  dashboardUnitDrafts: DashboardUnit[];
  dashboardSpaceNodes: SpaceNode[];
};

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
    private db: DbService
  ) {}

  async getDashboardsCatalog(item: {
    projectId: string;
    structId: string;
    user: UserTab;
    apiUserMember: Member;
    spaces: Space[];
  }): Result.ResultAsync<DashboardsCatalog, GetDashboardsCatalogError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'dashboards',
        (v): Result.ResultAsync<DashboardTab[], DashboardEntToTabError> =>
          this.db.dashboards.findMany({
            where: and(
              eq(dashboardsTable.structId, v.structId),
              or(
                eq(dashboardsTable.draft, false),
                and(
                  eq(dashboardsTable.draft, true),
                  eq(dashboardsTable.creatorId, v.user.userId)
                )
              )
            )
          })
      ),
      Result.bind(
        'dashboardsGrantedAccess',
        (v): Result.Result<DashboardTab[], never> =>
          Result.succeed(
            v.dashboards.filter(dashboard =>
              dashboard.draft === true
                ? true
                : checkAccess({
                    member: v.apiUserMember,
                    accessRoles: dashboard.accessRolesCombined,
                    filePath: dashboard.filePath
                  })
            )
          )
      ),
      Result.bind(
        'draftDashboards',
        (v): Result.Result<DashboardTab[], never> =>
          Result.succeed(
            v.dashboardsGrantedAccess.filter(
              dashboard => dashboard.draft === true
            )
          )
      ),
      Result.bind(
        'savedDashboards',
        (v): Result.Result<DashboardTab[], never> =>
          Result.succeed(
            v.dashboardsGrantedAccess.filter(
              dashboard => dashboard.draft === false
            )
          )
      ),
      Result.bind(
        'dashboardTargetIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.savedDashboards.map(dashboard => dashboard.dashboardId)
          )
      ),
      Result.bind(
        'favoriteDashboardIds',
        (v): Result.ResultAsync<string[], never> =>
          this.favoritesService
            .getFavoriteTargetIds({
              projectId: v.projectId,
              userId: v.user.userId,
              type: 'Dashboard',
              targetIds: v.dashboardTargetIds
            })
            .then(ids => Result.succeed(ids))
      ),
      Result.bind(
        'dashboardSpaceUnits',
        (v): Result.Result<SpaceUnit[], never> =>
          Result.succeed(
            v.savedDashboards.map(dashboard =>
              this.unitsService.makeDashboardSpaceUnit({
                dashboard: dashboard,
                member: v.apiUserMember,
                favoriteDashboardIds: v.favoriteDashboardIds
              })
            )
          )
      ),
      Result.map(
        (v): DashboardsCatalog => ({
          dashboardUnitDrafts: v.draftDashboards.map(dashboard =>
            this.unitsService.makeDashboardUnit({
              dashboard: dashboard,
              member: v.apiUserMember,
              favoriteDashboardIds: [],
              space: dashboard.space,
              spaceFullTitle: dashboard.space
                ? v.spaces.find(space => space.space === dashboard.space)
                    ?.fullTitle
                : ''
            })
          ),
          dashboardSpaceNodes: this.spaceService.makeSpaceNodes({
            spaces: v.spaces ?? [],
            units: v.dashboardSpaceUnits,
            member: v.apiUserMember,
            mySpaceTitle: MY_DASHBOARDS_SPACE_TITLE
          })
        })
      )
    );
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
  }): Result.ResultAsync<DashboardTab, GetDashboardCheckExistsAndAccessError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'dashboard',
        (
          v
        ): Result.ResultAsync<
          DashboardTab,
          GetDashboardCheckExistsAndAccessError
        > =>
          this.db.dashboards.findFirstCheckExists({
            where: and(
              eq(dashboardsTable.structId, v.structId),
              eq(dashboardsTable.dashboardId, v.dashboardId)
            )
          })
      ),
      Result.andThrough(v =>
        v.dashboard.draft === true && v.dashboard.creatorId !== v.user.userId
          ? Result.fail({ code: 'BACKEND_DASHBOARD_CREATOR_ID_MISMATCH' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.dashboard.draft === false &&
        checkAccess({
          member: v.userMember,
          accessRoles: v.dashboard.accessRolesCombined,
          filePath: v.dashboard.filePath
        }) === false
          ? Result.fail({ code: 'BACKEND_FORBIDDEN_DASHBOARD' })
          : Result.succeed()
      ),
      Result.map((v): DashboardTab => v.dashboard)
    );
  }

  async getDashboardXCheckExistsAndAccess(item: {
    dashboardId: string;
    structId: string;
    projectId: string;
    user: UserTab;
    apiUserMember: Member; // do not use membersService inside dashboardsService (circular dep with blockmlService)
  }): Result.ResultAsync<DashboardX, GetDashboardXCheckExistsAndAccessError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'dashboard',
        (
          v
        ): Result.ResultAsync<
          DashboardTab,
          GetDashboardCheckExistsAndAccessError
        > =>
          this.getDashboardCheckExistsAndAccess({
            structId: v.structId,
            dashboardId: v.dashboardId,
            userMember: v.apiUserMember,
            user: v.user
          })
      ),
      Result.bind(
        'dashboardX',
        (
          v
        ): Result.ResultAsync<
          DashboardX,
          GetDashboardXUsingDashboardTabError
        > =>
          this.getDashboardXUsingDashboardTab({
            dashboard: v.dashboard,
            structId: v.structId,
            projectId: v.projectId,
            apiUserMember: v.apiUserMember
          })
      ),
      Result.map((v): DashboardX => v.dashboardX)
    );
  }

  async getDashboardXUsingDashboardTab(item: {
    dashboard: DashboardTab;
    structId: string;
    projectId: string;
    apiUserMember: Member; // do not use membersService inside dashboardsService (circular dep with blockmlService)
  }): Result.ResultAsync<DashboardX, GetDashboardXUsingDashboardTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'mconfigIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.dashboard.tiles.map(x => x.mconfigId))
      ),
      Result.bind(
        'mconfigs',
        async (v): Result.ResultAsync<MconfigTab[], MconfigEntToTabError> =>
          v.mconfigIds.length === 0
            ? Result.succeed([])
            : this.db.mconfigs.findMany({
                where: inArray(mconfigsTable.mconfigId, v.mconfigIds)
              })
      ),
      Result.bind(
        'queryIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.dashboard.tiles.map(x => x.queryId))
      ),
      Result.bind(
        'queries',
        async (v): Result.ResultAsync<QueryTab[], QueryEntToTabError> =>
          v.queryIds.length === 0
            ? Result.succeed([])
            : this.db.queries.findMany({
                where: and(
                  inArray(queriesTable.queryId, v.queryIds),
                  eq(queriesTable.projectId, v.projectId)
                )
              })
      ),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.models.findMany({
            where: eq(modelsTable.structId, v.structId)
          })
      ),
      Result.bind(
        'assembleDashboardProjectionPayload',
        (v): Result.Result<AssembleDashboardProjectionPayload, never> => {
          let apiModels: ModelX[] = v.models.map(model =>
            this.modelsService.tabToApi({
              model: model,
              hasAccess: checkModelAccess({
                member: v.apiUserMember,
                modelAccessRoles: model.accessRolesCombined
              })
            })
          );

          let dashboardX: DashboardX = this.tabToApi({
            dashboard: v.dashboard,
            mconfigs: v.mconfigs.map(x =>
              this.mconfigsService.tabToApi({
                mconfig: x,
                modelFields: apiModels.find(m => m.modelId === x.modelId).fields
              })
            ),
            queries: v.queries.map(x =>
              this.queriesService.tabToApi({ query: x })
            ),
            member: v.apiUserMember,
            models: apiModels,
            isAddMconfigAndQuery: true
          });

          return Result.succeed({
            apiModels: apiModels,
            dashboardX: dashboardX
          });
        }
      ),
      Result.map(
        (v): DashboardX => v.assembleDashboardProjectionPayload.dashboardX
      )
    );
  }

  async getDashboardParts(item: {
    structId: string;
    user: UserTab;
    apiUserMember: Member;
  }): Result.ResultAsync<DashboardPart[], GetDashboardPartsError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'dashboards',
        (v): Result.ResultAsync<DashboardTab[], DashboardEntToTabError> =>
          this.db.drizzle
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
                eq(dashboardsTable.structId, v.structId),
                or(
                  eq(dashboardsTable.draft, false),
                  eq(dashboardsTable.creatorId, v.user.userId)
                )
              )
            )
            .then(xs =>
              Result.sequence(xs, x =>
                isUndefined(x as DashboardEnt)
                  ? Result.succeed(undefined)
                  : this.tabService.dashboardEntToTab({
                      dashboardEnt: x as DashboardEnt
                    })
              )
            )
      ),
      Result.bind(
        'dashboardsGrantedAccess',
        (v): Result.Result<DashboardTab[], never> =>
          Result.succeed(
            v.dashboards.filter(dashboard =>
              dashboard.draft === true
                ? true
                : checkAccess({
                    member: v.apiUserMember,
                    accessRoles: dashboard.accessRolesCombined,
                    filePath: dashboard.filePath
                  })
            )
          )
      ),
      Result.map((v): DashboardPart[] =>
        v.dashboardsGrantedAccess.map(dashboard =>
          this.tabToDashboardPart({
            dashboard: dashboard,
            member: v.apiUserMember
          })
        )
      )
    );
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
  }): Result.ResultAsync<ProcessDashboardOutput, ProcessDashboardError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'prepareDashboardQueriesPayload',
        (v): Result.Result<PrepareDashboardQueriesPayload, never> => {
          let dashboardMconfigIds: string[] = v.newApiDashboard.tiles.map(
            x => x.mconfigId
          );

          let dashboardMconfigs: Mconfig[] = v.apiMconfigs.filter(
            x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
          );

          let dashboardQueryIds: string[] = v.newApiDashboard.tiles.map(
            x => x.queryId
          );

          let dashboardQueries: QueryTab[] = v.apiQueries
            .filter(x => dashboardQueryIds.indexOf(x.queryId) > -1)
            .map(x => this.queriesService.apiToTab({ apiQuery: x }));

          let insertMconfigs: MconfigTab[] = [];

          let insertOrUpdateQueries: QueryTab[] = [];

          let insertOrDoNothingQueries: QueryTab[] = [];

          let dashboardMalloyMconfigs: Mconfig[] = dashboardMconfigs.filter(
            mconfig => mconfig.modelType === 'Malloy'
          );

          let dashboardMalloyQueries: QueryTab[] = [];

          dashboardMalloyMconfigs.forEach(apiMconfig => {
            let mconfig = this.mconfigsService.apiToTab({
              apiMconfig: apiMconfig
            });

            insertMconfigs.push(mconfig);

            let query = dashboardQueries.find(
              x => x.queryId === mconfig.queryId
            );

            if (
              dashboardMalloyQueries
                .map(x => x.queryId)
                .indexOf(query.queryId) < 0
            ) {
              dashboardMalloyQueries.push(query);
            }
          });

          let dashboardStoreMconfigs: Mconfig[] = dashboardMconfigs.filter(
            mconfig => mconfig.modelType === 'Store'
          );

          let storeQueries: QueryTab[] = [];

          return Result.succeed({
            dashboardMconfigIds: dashboardMconfigIds,
            dashboardMconfigs: dashboardMconfigs,
            dashboardQueryIds: dashboardQueryIds,
            dashboardQueries: dashboardQueries,
            insertMconfigs: insertMconfigs,
            insertOrUpdateQueries: insertOrUpdateQueries,
            insertOrDoNothingQueries: insertOrDoNothingQueries,
            dashboardMalloyMconfigs: dashboardMalloyMconfigs,
            dashboardMalloyQueries: dashboardMalloyQueries,
            dashboardStoreMconfigs: dashboardStoreMconfigs,
            storeQueries: storeQueries
          });
        }
      ),
      Result.andThrough(async v => {
        let storeQueriesResult: Result.Result<
          void[],
          PrepStoreMconfigQueryError
        > = await Result.sequence(
          v.prepareDashboardQueriesPayload.dashboardStoreMconfigs,
          async (
            apiMconfig
          ): Result.ResultAsync<void, PrepStoreMconfigQueryError> => {
            let newMconfig: MconfigTab;

            let newQuery: QueryTab;

            let isError: boolean = false;

            let apiModel: Model = v.apiModels.find(
              y => y.modelId === apiMconfig.modelId
            );

            let prepStoreMconfigQueryOutput: Result.Result<
              PrepStoreMconfigQueryOutput,
              PrepStoreMconfigQueryError
            > = await this.mconfigsService.prepStoreMconfigQuery({
              struct: v.tempStruct,
              project: v.project,
              envId: v.envId,
              mconfigParentType: 'Dashboard',
              mconfigParentId: v.newDashboardId,
              model: this.modelsService.apiToTab({ apiModel: apiModel }),
              mconfig: this.mconfigsService.apiToTab({
                apiMconfig: apiMconfig
              }),
              metricsStartDateYYYYMMDD: undefined,
              metricsEndDateYYYYMMDD: undefined
            });

            if (Result.isFailure(prepStoreMconfigQueryOutput)) {
              return prepStoreMconfigQueryOutput;
            }

            let mqe: {
              isError: boolean;
              newMconfig: MconfigTab;
              newQuery: QueryTab;
            } = prepStoreMconfigQueryOutput.value;

            newMconfig = mqe.newMconfig;

            newQuery = mqe.newQuery;

            isError = mqe.isError;

            let newDashboardTile: Tile = v.newApiDashboard.tiles.find(
              tile => tile.mconfigId === apiMconfig.mconfigId
            );

            newDashboardTile.queryId = newMconfig.queryId;

            newDashboardTile.mconfigId = newMconfig.mconfigId;

            newDashboardTile.trackChangeId = makeId();

            v.prepareDashboardQueriesPayload.insertMconfigs.push(newMconfig);

            v.prepareDashboardQueriesPayload.storeQueries.push(newQuery);

            return Result.succeed();
          }
        );

        if (Result.isFailure(storeQueriesResult)) {
          return storeQueriesResult;
        }

        return Result.succeed();
      }),
      Result.bind(
        'assembleDashboardPayload',
        (v): Result.Result<AssembleDashboardPayload, never> => {
          let combinedQueries: QueryTab[] = [
            ...v.prepareDashboardQueriesPayload.dashboardMalloyQueries,
            ...v.prepareDashboardQueriesPayload.storeQueries
          ];

          v.prepareDashboardQueriesPayload.insertMconfigs.forEach(mconfig => {
            let query = combinedQueries.find(
              y => y.queryId === mconfig.queryId
            );

            // Previous and new query IDs differ because their parent dashboard IDs differ.
            let prevTile = v.fromDashboardX.tiles.find(
              y => y.title === mconfig.chart.title
            );

            let prevQuery = prevTile?.query;

            if (
              v.isQueryCache === true &&
              query.status !== 'Error' &&
              isDefined(prevQuery) &&
              prevQuery.status === 'Completed'
            ) {
              query.data = prevQuery.data;

              query.status = prevQuery.status;

              query.lastCompleteTs = prevQuery.lastCompleteTs;

              query.lastCompleteDuration = prevQuery.lastCompleteDuration;

              v.prepareDashboardQueriesPayload.insertOrUpdateQueries.push(
                query
              );
            } else if (
              v.isQueryCache === true &&
              query.status !== 'Error' &&
              prevTile.queryId === EMPTY_QUERY_ID &&
              v.cachedQueries.length > 0
            ) {
              let cachedMconfig = v.cachedMconfigs.find(
                x => x.chart.title === mconfig.chart.title
              );

              let cachedQuery = v.cachedQueries.find(
                x => x.queryId === cachedMconfig.queryId
              );

              if (cachedQuery.status === 'Completed') {
                query.data = cachedQuery.data;

                query.status = cachedQuery.status;

                query.lastCompleteTs = cachedQuery.lastCompleteTs;

                query.lastCompleteDuration = cachedQuery.lastCompleteDuration;

                v.prepareDashboardQueriesPayload.insertOrUpdateQueries.push(
                  query
                );
              } else {
                v.prepareDashboardQueriesPayload.insertOrDoNothingQueries.push(
                  query
                );
              }
            } else {
              v.prepareDashboardQueriesPayload.insertOrDoNothingQueries.push(
                query
              );
            }
          });

          let newDashboard: DashboardTab = this.apiToTab({
            apiDashboard: v.newApiDashboard
          });

          return Result.succeed({
            combinedQueries: combinedQueries,
            newDashboard: newDashboard
          });
        }
      ),
      Result.map(
        (v): ProcessDashboardOutput => ({
          newDashboard: v.assembleDashboardPayload.newDashboard,
          insertMconfigs: v.prepareDashboardQueriesPayload.insertMconfigs,
          insertOrUpdateQueries:
            v.prepareDashboardQueriesPayload.insertOrUpdateQueries,
          insertOrDoNothingQueries:
            v.prepareDashboardQueriesPayload.insertOrDoNothingQueries
        })
      )
    );
  }
}
