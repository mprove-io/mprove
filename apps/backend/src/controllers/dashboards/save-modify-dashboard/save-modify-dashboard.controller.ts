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
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { checkAccess } from '~backend/functions/check-access';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeDashboardFileText } from '~backend/functions/make-dashboard-file-text';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  RESTRICTED_USER_ALIAS,
  UTC
} from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
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
    private wrapToApiService: WrapToApiService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private dashboardsService: DashboardsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private wrapToEntService: WrapToEntService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard)
  async saveModifyDashboard(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendSaveModifyDashboardRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

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
      // skipMetrics: false
    });

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (
      userMember.isAdmin === false &&
      projectId === demoProjectId &&
      repoId === PROD_REPO_ID
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let fromDashboardEntity =
      await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.structId,
        dashboardId: fromDashboardId
      });

    let fromDashboard = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: userMember,
      dashboard: fromDashboardEntity,
      bridge: bridge,
      projectId: projectId
    });

    let toDashboardEntity =
      await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.structId,
        dashboardId: toDashboardId
      });

    if (userMember.isAdmin === false && userMember.isEditor === false) {
      this.dashboardsService.checkDashboardPath({
        userAlias: user.alias,
        filePath: toDashboardEntity.filePath
      });
    }

    let pathParts = toDashboardEntity.filePath.split('.');
    pathParts[pathParts.length - 1] = FileExtensionEnum.Malloy.slice(1);

    // let secondFileNodeId = pathParts.join('.');

    let dashFileText: string;
    // let secondFileContent: string;

    if (isDefined(newTile)) {
      let mconfigModel = await this.modelsService.getModelCheckExists({
        structId: bridge.structId,
        modelId: newTile.mconfig.modelId
      });

      let isAccessGranted = checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: mconfigModel
      });

      if (isAccessGranted === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_FORBIDDEN_MODEL
        });
      }

      newTile.mconfig.chart.title = newTile.title;

      let plateY = 0;

      fromDashboard.tiles.forEach(tile => {
        plateY = plateY + tile.plateHeight;
      });

      newTile.plateY = plateY;

      if (isReplaceTile === true) {
        let oldTileIndex = fromDashboard.tiles.findIndex(
          x => x.title === selectedTileTitle
        );

        let oldTile = fromDashboard.tiles[oldTileIndex];

        newTile.plateWidth = oldTile.plateWidth;
        newTile.plateHeight = oldTile.plateHeight;
        newTile.plateX = oldTile.plateX;
        newTile.plateY = oldTile.plateY;

        fromDashboard.tiles[oldTileIndex] = newTile;
      } else {
        fromDashboard.tiles = [...fromDashboard.tiles, newTile];
      }

      let {
        dashboardFileText
        // , malloyFileText
      } = makeDashboardFileText({
        dashboard: fromDashboard,
        newDashboardId: fromDashboard.dashboardId,
        newTitle: fromDashboard.title,
        roles: fromDashboard.accessRoles.join(', '),
        caseSensitiveStringFilters:
          currentStruct.mproveConfig.caseSensitiveStringFilters,
        timezone: UTC
        // malloyDashboardFilePath: secondFileNodeId
      });

      dashFileText = dashboardFileText;
      // secondFileContent = malloyFileText;
    } else {
      // dashboard save as - replace existing
      let yTiles: TileX[] = [];

      tilesGrid.forEach(freshTile => {
        let yTile = fromDashboard.tiles.find(y => freshTile.title === y.title);

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

      fromDashboard.tiles = yTiles;

      let {
        dashboardFileText
        // malloyFileText
      } = makeDashboardFileText({
        dashboard: fromDashboard,
        newDashboardId: toDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        caseSensitiveStringFilters:
          currentStruct.mproveConfig.caseSensitiveStringFilters,
        timezone: UTC
        // malloyDashboardFilePath: secondFileNodeId
      });

      dashFileText = dashboardFileText;
      // secondFileContent = malloyFileText;
    }

    let apiProject = this.wrapToApiService.wrapToApiProject({
      project: project,
      isAddGitUrl: true,
      isAddPrivateKey: true,
      isAddPublicKey: true
    });

    let toDiskSaveFileRequest: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: apiProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: toDashboardEntity.filePath,
        userAlias: user.alias,
        content: dashFileText
        // secondFileNodeId: secondFileNodeId,
        // secondFileContent: secondFileContent,
        // isDeleteSecondFile: isUndefinedOrEmpty(secondFileContent),
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
        file => file.fileNodeId === toDashboardEntity.filePath
      )
    ];

    let modelIds = (
      (isDefined(newTile) ? fromDashboard?.tiles : tilesGrid) ?? []
    ).map(tile => tile.modelId);

    let cachedModels = await this.db.drizzle.query.modelsTable.findMany({
      where: and(
        eq(modelsTable.structId, bridge.structId),
        inArray(modelsTable.modelId, modelIds)
      )
    });

    let { struct, dashboards, mconfigs, queries } =
      await this.blockmlService.rebuildStruct({
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

    currentStruct.errors = [...currentStruct.errors, ...struct.errors];

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

    let newDashboard = dashboards.find(x => x.dashboardId === toDashboardId);

    if (isUndefined(newDashboard)) {
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

      let fileIdAr = toDashboardEntity.filePath.split('/');
      fileIdAr.shift();
      let filePath = fileIdAr.join('/');

      throw new ServerError({
        message: ErEnum.BACKEND_MODIFY_DASHBOARD_FAIL,
        displayData: {
          encodedFileId: encodeFilePath({ filePath: filePath }),
          structErrors: struct.errors
        }
      });
    }

    let dashboardMconfigIds = newDashboard.tiles.map(x => x.mconfigId);
    let dashboardMconfigs = mconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = newDashboard.tiles.map(x => x.queryId);
    let dashboardQueries = queries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    let dashboardEntity =
      this.wrapToEntService.wrapToEntityDashboard(newDashboard);

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
                this.wrapToEntService.wrapToEntityMconfig(x)
              )
            },
            insertOrUpdate: {
              dashboards: isDefined(dashboardEntity) ? [dashboardEntity] : []
            },
            insertOrDoNothing: {
              queries: dashboardQueries.map(x =>
                this.wrapToEntService.wrapToEntityQuery(x)
              )
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let newDashboardParts = await this.dashboardsService.getDashboardParts({
      structId: bridge.structId,
      user: user,
      userMember: userMember,
      newDashboard: newDashboard
    });

    let newDashboardX = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: userMember,
      dashboard: dashboardEntity,
      bridge: bridge,
      projectId: projectId
    });

    let payload: ToBackendSaveModifyDashboardResponsePayload = {
      dashboard: newDashboardX,
      newDashboardPart:
        newDashboardParts.length > 0 ? newDashboardParts[0] : undefined
    };

    return payload;
  }
}
