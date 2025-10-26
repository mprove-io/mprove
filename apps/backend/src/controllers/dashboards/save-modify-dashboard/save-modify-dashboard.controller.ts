import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeDashboardFileText } from '~backend/functions/make-dashboard-file-text';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { DashboardsService } from '~backend/services/db/dashboards.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { UsersService } from '~backend/services/db/users.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { TabService } from '~backend/services/tab.service';
import { EMPTY_STRUCT_ID, PROD_REPO_ID, UTC } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { TileX } from '~common/interfaces/backend/tile-x';
import {
  ToBackendSaveModifyDashboardRequest,
  ToBackendSaveModifyDashboardResponsePayload
} from '~common/interfaces/to-backend/dashboards/to-backend-save-modify-dashboard';
import {
  ToDiskSaveFileRequest,
  ToDiskSaveFileResponse
} from '~common/interfaces/to-disk/07-files/to-disk-save-file';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveModifyDashboardController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private dashboardsService: DashboardsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard)
  async saveModifyDashboard(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSaveModifyDashboardRequest = request.body;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      toDashboardId,
      fromDashboardId,
      selectedTileTitle,
      newTile,
      isReplaceTile,
      accessRoles,
      dashboardTitle,
      tilesGrid
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    await this.projectsService.checkProjectIsNotRestricted({
      projectId: projectId,
      userMember: userMember,
      repoId: repoId
    });

    if (userMember.isExplorer === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let fromDashboardX =
      await this.dashboardsService.getDashboardXCheckExistsAndAccess({
        dashboardId: fromDashboardId,
        structId: bridge.structId,
        apiUserMember: apiUserMember,
        projectId: projectId,
        user: user
      });

    let toDashboard =
      await this.dashboardsService.getDashboardCheckExistsAndAccess({
        structId: bridge.structId,
        dashboardId: toDashboardId,
        userMember: userMember,
        user: user
      });

    if (userMember.isAdmin === false && userMember.isEditor === false) {
      this.dashboardsService.checkDashboardPath({
        userAlias: user.alias,
        filePath: toDashboard.filePath
      });
    }

    let pathParts = toDashboard.filePath.split('.');
    pathParts[pathParts.length - 1] = FileExtensionEnum.Malloy.slice(1);

    let dashFileText: string;

    if (isDefined(newTile)) {
      await this.modelsService.getModelCheckExistsAndAccess({
        structId: bridge.structId,
        modelId: newTile.mconfig.modelId,
        userMember: userMember
      });

      newTile.mconfig.chart.title = newTile.title;

      let plateY = 0;

      fromDashboardX.tiles.forEach(tile => {
        plateY = plateY + tile.plateHeight;
      });

      newTile.plateY = plateY;

      if (isReplaceTile === true) {
        let oldTileIndex = fromDashboardX.tiles.findIndex(
          x => x.title === selectedTileTitle
        );

        let oldTile = fromDashboardX.tiles[oldTileIndex];

        newTile.plateWidth = oldTile.plateWidth;
        newTile.plateHeight = oldTile.plateHeight;
        newTile.plateX = oldTile.plateX;
        newTile.plateY = oldTile.plateY;

        fromDashboardX.tiles[oldTileIndex] = newTile;
      } else {
        fromDashboardX.tiles = [...fromDashboardX.tiles, newTile];
      }

      let { dashboardFileText } = makeDashboardFileText({
        dashboard: fromDashboardX,
        newDashboardId: fromDashboardX.dashboardId,
        newTitle: fromDashboardX.title,
        roles: fromDashboardX.accessRoles.join(', '),
        caseSensitiveStringFilters:
          currentStruct.mproveConfig.caseSensitiveStringFilters,
        timezone: UTC
      });

      dashFileText = dashboardFileText;
    } else {
      if (isDefined(tilesGrid)) {
        let yTiles: TileX[] = [];

        tilesGrid.forEach(freshTile => {
          let yTile = fromDashboardX.tiles.find(
            y => freshTile.title === y.title
          );

          yTile.plateX = freshTile.plateX;
          yTile.plateY = freshTile.plateY;
          yTile.plateWidth = freshTile.plateWidth;
          yTile.plateHeight = freshTile.plateHeight;

          yTile.listen = freshTile.listen;
          yTile.mconfig.filters = yTile.mconfig.filters.filter(
            k =>
              isUndefined(freshTile.deletedFilterFieldIds) ||
              freshTile.deletedFilterFieldIds.indexOf(k.fieldId) < 0
          );

          yTiles.push(yTile);
        });

        fromDashboardX.tiles = yTiles;
      }

      let { dashboardFileText } = makeDashboardFileText({
        dashboard: fromDashboardX,
        newDashboardId: toDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        caseSensitiveStringFilters:
          currentStruct.mproveConfig.caseSensitiveStringFilters,
        timezone: UTC
      });

      dashFileText = dashboardFileText;
    }

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskSaveFileRequest: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: toDashboard.filePath,
        userAlias: user.alias,
        content: dashFileText
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskSaveFileResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskSaveFileRequest,
        checkIsOk: true
      });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      if (x.envId !== envId) {
        x.structId = EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    let diskFiles = [
      diskResponse.payload.files.find(
        file => file.fileNodeId === toDashboard.filePath
      )
    ];

    let modelIds = [
      ...(fromDashboardX?.tiles ?? []).map(tile => tile.modelId),
      ...fromDashboardX.fields
        .filter(x => isDefined(x.storeModel))
        .map(x => x.storeModel)
    ];

    let cachedModels = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(
          eq(modelsTable.structId, bridge.structId),
          inArray(modelsTable.modelId, modelIds)
        )
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let {
      struct: apiStruct,
      dashboards: apiDashboards,
      mconfigs: apiMconfigs,
      queries: apiQueries
    } = await this.blockmlService.rebuildStruct({
      traceId: traceId,
      projectId: projectId,
      structId: bridge.structId,
      diskFiles: diskFiles,
      mproveDir: currentStruct.mproveConfig.mproveDirValue,
      skipDb: true,
      envId: envId,
      overrideTimezone: undefined,
      isUseCache: true,
      cachedMproveConfig: currentStruct.mproveConfig,
      cachedModels: cachedModels,
      cachedMetrics: []
    });

    currentStruct.errors = [...currentStruct.errors, ...apiStruct.errors];

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              structs: [currentStruct],
              bridges: [...branchBridges]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let newApiDashboard = apiDashboards.find(
      x => x.dashboardId === toDashboardId
    );

    if (isUndefined(newApiDashboard)) {
      await retry(
        async () =>
          await this.db.drizzle.transaction(async tx => {
            await tx
              .delete(dashboardsTable)
              .where(
                and(
                  eq(dashboardsTable.dashboardId, toDashboardId),
                  eq(dashboardsTable.structId, bridge.structId)
                )
              );
          }),
        getRetryOption(this.cs, this.logger)
      );

      let fileIdAr = toDashboard.filePath.split('/');
      fileIdAr.shift();
      let filePath = fileIdAr.join('/');

      throw new ServerError({
        message: ErEnum.BACKEND_MODIFY_DASHBOARD_FAIL,
        displayData: {
          encodedFileId: encodeFilePath({ filePath: filePath }),
          structErrors: apiStruct.errors
        }
      });
    }

    let dashboardMconfigIds = newApiDashboard.tiles.map(x => x.mconfigId);
    let dashboardMconfigs = apiMconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = newApiDashboard.tiles.map(x => x.queryId);
    let dashboardQueries = apiQueries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    newApiDashboard.tiles.forEach(tile => {
      let query = apiQueries.find(q => q.queryId === tile.queryId);

      // prev query and new query has different queryId (different parent dashboardId)
      let prevTile = fromDashboardX.tiles.find(y => y.title === tile.title);

      let prevQuery = prevTile?.query;

      if (
        isDefined(prevQuery) &&
        prevQuery.status === QueryStatusEnum.Completed &&
        query.status !== QueryStatusEnum.Error
      ) {
        query.data = prevTile?.query?.data;
        query.status = prevTile?.query?.status;
        query.lastRunBy = prevTile?.query?.lastRunBy;
        query.lastRunTs = prevTile?.query?.lastRunTs;
        query.lastCancelTs = prevTile?.query?.lastCancelTs;
        query.lastCompleteTs = prevTile?.query?.lastCompleteTs;
        query.lastCompleteDuration = prevTile?.query?.lastCompleteDuration;
        query.lastErrorMessage = prevTile?.query?.lastErrorMessage;
        query.lastErrorTs = prevTile?.query?.lastErrorTs;
      }
    });

    let newDashboard = this.dashboardsService.apiToTab({
      apiDashboard: newApiDashboard
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(dashboardsTable)
            .where(
              and(
                eq(dashboardsTable.draft, true),
                eq(dashboardsTable.dashboardId, fromDashboardId),
                eq(dashboardsTable.structId, bridge.structId)
              )
            );

          await this.db.packer.write({
            tx: tx,
            insert: {
              mconfigs: dashboardMconfigs.map(x =>
                this.mconfigsService.apiToTab({ apiMconfig: x })
              )
            },
            insertOrUpdate: {
              dashboards: [newDashboard],
              queries: dashboardQueries.map(x =>
                this.queriesService.apiToTab({ apiQuery: x })
              )
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let apiFinalDashboardX =
      await this.dashboardsService.getDashboardXCheckExistsAndAccess({
        dashboardId: newDashboard.dashboardId,
        structId: bridge.structId,
        apiUserMember: apiUserMember,
        projectId: projectId,
        user: user
      });

    let newDashboardPart = await this.dashboardsService.getDashboardPart({
      newDashboard: newDashboard,
      structId: bridge.structId,
      user: user,
      apiUserMember: apiUserMember
    });

    let payload: ToBackendSaveModifyDashboardResponsePayload = {
      dashboard: apiFinalDashboardX,
      newDashboardPart: newDashboardPart
    };

    return payload;
  }
}
