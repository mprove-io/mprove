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
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { UsersService } from '~backend/services/db/users.service';
import { RpcService } from '~backend/services/rpc.service';
import { TabService } from '~backend/services/tab.service';
import {
  EMPTY_STRUCT_ID,
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER,
  PROD_REPO_ID,
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
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { TileX } from '~common/interfaces/backend/tile-x';
import {
  ToBackendSaveCreateDashboardRequest,
  ToBackendSaveCreateDashboardResponsePayload
} from '~common/interfaces/to-backend/dashboards/to-backend-save-create-dashboard';
import {
  ToDiskCreateFileRequest,
  ToDiskCreateFileResponse
} from '~common/interfaces/to-disk/07-files/to-disk-create-file';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveCreateDashboardController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rpcService: RpcService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSaveCreateDashboard)
  async saveCreateDashboard(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSaveCreateDashboardRequest = request.body;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      newDashboardId,
      fromDashboardId,
      dashboardTitle,
      accessRoles,
      tilesGrid,
      timezone
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

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    await this.projectsService.checkProjectIsNotRestricted({
      projectId: projectId,
      userMember: userMember,
      repoId: repoId
    });

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

    let mdir = currentStruct.mproveConfig.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let parentNodeId =
      currentStruct.mproveConfig.mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
        ? `${projectId}/${MPROVE_USERS_FOLDER}/${user.alias}`
        : `${projectId}/${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}`;

    let fileName = `${newDashboardId}${FileExtensionEnum.Dashboard}`;

    let dashFileText: string;

    let fromDashboardX: DashboardX;

    if (isDefined(fromDashboardId)) {
      fromDashboardX =
        await this.dashboardsService.getDashboardXCheckExistsAndAccess({
          dashboardId: fromDashboardId,
          structId: bridge.structId,
          apiUserMember: apiUserMember,
          projectId: projectId,
          user: user
        });

      let yTiles: TileX[] = [];

      tilesGrid.forEach(freshTile => {
        let yTile = fromDashboardX.tiles.find(y => freshTile.title === y.title);

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

      let { dashboardFileText } = makeDashboardFileText({
        dashboard: fromDashboardX,
        newDashboardId: newDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        caseSensitiveStringFilters:
          currentStruct.mproveConfig.caseSensitiveStringFilters,
        timezone: UTC
      });

      dashFileText = dashboardFileText;
    } else {
      let newDashboard: DashboardX = {
        structId: undefined,
        dashboardId: newDashboardId,
        draft: false,
        creatorId: undefined,
        filePath: undefined,
        content: undefined,
        accessRoles: undefined,
        title: undefined,
        tiles: [],
        author: undefined,
        canEditOrDeleteDashboard: undefined,
        serverTs: undefined,
        extendedFilters: [],
        storeModels: [],
        fields: []
      };

      let { dashboardFileText } = makeDashboardFileText({
        dashboard: newDashboard,
        newDashboardId: newDashboardId,
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

    let toDiskCreateFileRequest: ToDiskCreateFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        parentNodeId: parentNodeId,
        fileName: fileName,
        fileText: dashFileText,
        userAlias: user.alias
      }
    };

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskCreateFileResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
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
        file => file.fileNodeId === `${parentNodeId}/${fileName}`
      )
    ];

    let modelIds = [
      ...(
        (isDefined(fromDashboardId) ? fromDashboardX?.tiles : tilesGrid) ?? []
      ).map(tile => tile.modelId),
      ...(isDefined(fromDashboardId)
        ? fromDashboardX.fields
            .filter(x => isDefined(x.storeModel))
            .map(x => x.storeModel)
        : [])
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
      dashboards: apiDashboards,
      mconfigs: apiMconfigs,
      queries: apiQueries,
      models: apiModels,
      struct: tempStruct
    } = await this.blockmlService.rebuildStruct({
      traceId,
      projectId,
      structId: bridge.structId,
      diskFiles: diskFiles,
      mproveDir: currentStruct.mproveConfig.mproveDirValue,
      skipDb: true,
      envId: envId,
      overrideTimezone: timezone,
      isUseCache: true,
      cachedMproveConfig: currentStruct.mproveConfig,
      cachedModels: cachedModels,
      cachedMetrics: []
    });

    currentStruct.errors = [...currentStruct.errors, ...tempStruct.errors];

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
      x => x.dashboardId === newDashboardId
    );

    if (isUndefined(newApiDashboard)) {
      let fileId = `${parentNodeId}/${fileName}`;
      let fileIdAr = fileId.split('/');
      fileIdAr.shift();
      let filePath = fileIdAr.join('/');

      throw new ServerError({
        message: ErEnum.BACKEND_CREATE_DASHBOARD_FAIL,
        displayData: {
          encodedFileId: encodeFilePath({ filePath: filePath }),
          structErrors: tempStruct.errors
        }
      });
    }

    let {
      newDashboard,
      insertMconfigs,
      insertOrUpdateQueries,
      insertOrDoNothingQueries
    } = await this.dashboardsService.processDashboard({
      newApiDashboard: newApiDashboard,
      apiMconfigs: apiMconfigs,
      apiQueries: apiQueries,
      apiModels: apiModels,
      fromDashboardX: fromDashboardX,
      isQueryCache: true,
      cachedQueries: [],
      cachedMconfigs: [],
      envId: envId,
      newDashboardId: newDashboardId,
      tempStruct: tempStruct,
      project: project
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          if (isDefined(fromDashboardId)) {
            await tx
              .delete(dashboardsTable)
              .where(
                and(
                  eq(dashboardsTable.draft, true),
                  eq(dashboardsTable.dashboardId, fromDashboardId),
                  eq(dashboardsTable.structId, bridge.structId)
                )
              );
          }

          await this.db.packer.write({
            tx: tx,
            insert: {
              dashboards: [newDashboard],
              mconfigs: insertMconfigs
            },
            insertOrUpdate: {
              queries: insertOrUpdateQueries
            },
            insertOrDoNothing: {
              queries: insertOrDoNothingQueries
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let newDashboardPart = await this.dashboardsService.getDashboardPart({
      newDashboard: newDashboard,
      structId: bridge.structId,
      user: user,
      apiUserMember: apiUserMember
    });

    let payload: ToBackendSaveCreateDashboardResponsePayload = {
      newDashboardPart: newDashboardPart
    };

    return payload;
  }
}
