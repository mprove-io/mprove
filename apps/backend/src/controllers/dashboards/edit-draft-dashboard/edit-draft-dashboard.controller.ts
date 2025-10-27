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
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeDashboardFileText } from '~backend/functions/make-dashboard-file-text';
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
import { TabService } from '~backend/services/tab.service';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER,
  PROD_REPO_ID,
  UTC
} from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { TileX } from '~common/interfaces/backend/tile-x';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import {
  ToBackendEditDraftDashboardRequest,
  ToBackendEditDraftDashboardResponsePayload
} from '~common/interfaces/to-backend/dashboards/to-backend-edit-draft-dashboard';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditDraftDashboardController {
  constructor(
    private tabService: TabService,
    private branchesService: BranchesService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditDraftDashboard)
  async editDraftDashboard(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendEditDraftDashboardRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      oldDashboardId,
      newDashboardFields,
      tiles,
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

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

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
        dashboardId: oldDashboardId,
        structId: bridge.structId,
        apiUserMember: apiUserMember,
        projectId: projectId,
        user: user
      });

    let yTiles: TileX[] = [];

    tiles.forEach(freshTile => {
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
    fromDashboardX.fields = newDashboardFields;

    // oldDashboardId is not on disk because it is draft
    let newDashboardId = oldDashboardId;

    let fileName = `${newDashboardId}${FileExtensionEnum.Dashboard}`;

    let mdir = currentStruct.mproveConfig.mproveDirValue;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let relativePath =
      currentStruct.mproveConfig.mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
        ? `${MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`
        : `${mdir}/${MPROVE_USERS_FOLDER}/${user.alias}/${fileName}`;

    let fileNodeId = `${projectId}/${relativePath}`;

    let pathString = JSON.stringify(fileNodeId.split('/'));

    let fileId = encodeFilePath({ filePath: relativePath });

    let { dashboardFileText } = makeDashboardFileText({
      dashboard: fromDashboardX,
      newDashboardId: newDashboardId,
      newTitle: newDashboardId,
      roles: fromDashboardX.accessRoles.join(', '),
      caseSensitiveStringFilters:
        currentStruct.mproveConfig.caseSensitiveStringFilters,
      timezone: UTC
    });

    // add dashboard file

    let tempFile: DiskCatalogFile = {
      projectId: projectId,
      repoId: repoId,
      fileId: fileId,
      pathString: pathString,
      fileNodeId: fileNodeId,
      name: fileName,
      content: dashboardFileText
    };

    let diskFiles = [tempFile];

    let modelIds = [
      ...(tiles ?? []).map(tile => tile.modelId),
      ...newDashboardFields
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
      struct: tempStruct,
      dashboards: apiDashboards,
      mconfigs: apiMconfigs,
      models: apiModels,
      queries: apiQueries
    } = await this.blockmlService.rebuildStruct({
      traceId: traceId,
      projectId: projectId,
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

    let newApiDashboard = apiDashboards.find(
      x => x.dashboardId === newDashboardId
    );

    if (isUndefined(newApiDashboard)) {
      throw new ServerError({
        message: ErEnum.BACKEND_EDIT_DRAFT_DASHBOARD_FAILED,
        displayData: {
          structErrors: tempStruct.errors
        }
      });
    }

    newApiDashboard.draft = true;
    newApiDashboard.creatorId = user.userId;

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
      isQueryCache: false,
      cachedQueries: [],
      cachedMconfigs: [],
      envId: envId,
      newDashboardId: newDashboardId,
      tempStruct: tempStruct,
      project: project
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                mconfigs: insertMconfigs
              },
              insertOrUpdate: {
                dashboards: [newDashboard],
                queries: insertOrUpdateQueries
              },
              insertOrDoNothing: {
                queries: insertOrDoNothingQueries
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let newDashboardX =
      await this.dashboardsService.getDashboardXCheckExistsAndAccess({
        dashboardId: newDashboard.dashboardId,
        projectId: projectId,
        structId: bridge.structId,
        apiUserMember: apiUserMember,
        user: user
      });

    let payload: ToBackendEditDraftDashboardResponsePayload = {
      dashboard: newDashboardX
    };

    return payload;
  }
}
