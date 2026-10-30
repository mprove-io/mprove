import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendEditDraftDashboardRequestDto,
  ToBackendEditDraftDashboardResponseDto
} from '#backend/controllers/dashboards/edit-draft-dashboard/edit-draft-dashboard.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { rebuildBlockmlStruct } from '#backend/functions/blockml/rebuild-blockml-struct/rebuild-blockml-struct';
import { getDashboardXCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-x-check-exists-and-access/get-dashboard-x-check-exists-and-access';
import { makeDashboardFileText } from '#backend/functions/db/dashboards/make-dashboard-file-text/make-dashboard-file-text';
import { processDashboard } from '#backend/functions/db/dashboards/process-dashboard/process-dashboard';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { getUserSelectedGivens } from '#backend/functions/db/users/get-user-selected-givens/get-user-selected-givens';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER,
  UTC
} from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { TileX } from '#common/types/backend/parts/tile/tile-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditDraftDashboardOutput } from '#common/types/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-output';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

type ReviseDashboardFilePayload = {
  yTiles: TileX[];
  newDashboardId: string;
  fileName: string;
  mdir: string;
  relativePath: string;
  fileNodeId: string;
  pathString: string;
  fileId: string;
  dashboardFileText: string;
  tempFile: DiskCatalogFile;
  diskFiles: DiskCatalogFile[];
  modelIds: string[];
};

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditDraftDashboardController {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private rpcService: RpcService,
    private logger: Logger
  ) {}

  @Post('api/ToBackendEditDraftDashboard' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditDraftDashboard',
    description: 'Edit tiles and fields of an existing draft dashboard'
  })
  @ApiOkResponse({
    type: ToBackendEditDraftDashboardResponseDto
  })
  async editDraftDashboard(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditDraftDashboardRequestDto
  ): Promise<BackendResultForOperation<'editDraftDashboard'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        oldDashboardId: body.input.oldDashboardId,
        newDashboardFields: body.input.newDashboardFields,
        tiles: body.input.tiles,
        timezone: body.input.timezone
      }),
      Result.andThrough(v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        })
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('apiUserMember', v =>
        Result.succeed(
          memberTabToApi({
            member: v.userMember
          })
        )
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('currentStruct', v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('fromDashboardX', v =>
        getDashboardXCheckExistsAndAccess({
          db: this.db,
          dashboardId: v.oldDashboardId,
          structId: v.bridge.structId,
          apiUserMember: v.apiUserMember,
          projectId: v.projectId,
          user: v.user
        })
      ),
      Result.bind('reviseDashboardFilePayload', v => {
        let yTiles: TileX[] = [];

        v.tiles.forEach(freshTile => {
          let yTile = v.fromDashboardX.tiles.find(
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

        v.fromDashboardX.tiles = yTiles;

        v.fromDashboardX.fields = v.newDashboardFields;

        // oldDashboardId is not on disk because it is draft
        let newDashboardId: string = v.oldDashboardId;

        let fileName: string = `${newDashboardId}${'.dashboard' satisfies FileExtension}`;

        let mdir: string = v.currentStruct.mproveConfig.mproveDirValue;

        if (
          mdir.length > 2 &&
          mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
        ) {
          mdir = mdir.substring(2);
        }

        let relativePath: string =
          v.currentStruct.mproveConfig.mproveDirValue ===
          MPROVE_CONFIG_DIR_DOT_SLASH
            ? `${MPROVE_USERS_FOLDER}/${v.user.alias}/${fileName}`
            : `${mdir}/${MPROVE_USERS_FOLDER}/${v.user.alias}/${fileName}`;

        let fileNodeId: string = `${v.projectId}/${relativePath}`;

        let pathString: string = JSON.stringify(fileNodeId.split('/'));

        let fileId: string = encodeFilePath({ filePath: relativePath });

        let dashboardFileText: string = makeDashboardFileText({
          dashboard: v.fromDashboardX,
          newDashboardId: newDashboardId,
          newTitle: newDashboardId,
          roles: [],
          caseSensitiveStringFilters:
            v.currentStruct.mproveConfig.caseSensitiveStringFilters,
          timezone: UTC
        });

        let tempFile: DiskCatalogFile = {
          projectId: v.projectId,
          repoId: v.repoId,
          fileId: fileId,
          pathString: pathString,
          fileNodeId: fileNodeId,
          name: fileName,
          content: dashboardFileText
        };

        let diskFiles: DiskCatalogFile[] = [tempFile];

        let modelIds: string[] = [
          ...(v.tiles ?? []).map(tile => tile.modelId),
          ...v.newDashboardFields
            .filter(x => isDefined(x.storeModel))
            .map(x => x.storeModel)
        ];

        let reviseDashboardFilePayload: ReviseDashboardFilePayload = {
          yTiles: yTiles,
          newDashboardId: newDashboardId,
          fileName: fileName,
          mdir: mdir,
          relativePath: relativePath,
          fileNodeId: fileNodeId,
          pathString: pathString,
          fileId: fileId,
          dashboardFileText: dashboardFileText,
          tempFile: tempFile,
          diskFiles: diskFiles,
          modelIds: modelIds
        };

        return Result.succeed(reviseDashboardFilePayload);
      }),
      Result.bind('cachedModels', v =>
        this.db.models.findMany({
          where: and(
            eq(modelsTable.structId, v.bridge.structId),
            inArray(modelsTable.modelId, v.reviseDashboardFilePayload.modelIds)
          )
        })
      ),
      Result.bind('selectedGivens', v =>
        getUserSelectedGivens({
          user: v.user,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('rebuild', v =>
        rebuildBlockmlStruct({
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          structId: v.bridge.structId,
          diskFiles: v.reviseDashboardFilePayload.diskFiles,
          mproveDir: v.currentStruct.mproveConfig.mproveDirValue,
          skipDb: true,
          envId: v.envId,
          selectedGivens: v.selectedGivens,
          overrideTimezone: v.timezone,
          isUseCache: true,
          cachedMproveConfig: v.currentStruct.mproveConfig,
          cachedModels: v.cachedModels,
          cachedMetrics: [],
          db: this.db,
          tabService: this.tabService,
          rpcService: this.rpcService,
          cs: this.cs,
          logger: this.logger
        })
      ),
      Result.bind('newApiDashboard', v =>
        Result.succeed(
          v.rebuild.dashboards.find(
            x => x.dashboardId === v.reviseDashboardFilePayload.newDashboardId
          )
        )
      ),
      Result.andThrough(v =>
        isUndefined(v.newApiDashboard)
          ? Result.fail({
              code: 'BACKEND_EDIT_DRAFT_DASHBOARD_FAILED',
              displayData: {
                structErrors: v.rebuild.struct.errors
              }
            })
          : Result.succeed()
      ),
      Result.andThrough(v => {
        v.newApiDashboard.draft = true;

        v.newApiDashboard.creatorId = v.user.userId;

        return Result.succeed();
      }),
      Result.bind('processedDashboard', v =>
        processDashboard({
          db: this.db,
          newApiDashboard: v.newApiDashboard,
          apiMconfigs: v.rebuild.mconfigs,
          apiQueries: v.rebuild.queries,
          apiModels: v.rebuild.models,
          fromDashboardX: v.fromDashboardX,
          isQueryCache: false,
          cachedQueries: [],
          cachedMconfigs: [],
          envId: v.envId,
          newDashboardId: v.reviseDashboardFilePayload.newDashboardId,
          tempStruct: v.rebuild.struct,
          project: v.project
        })
      ),
      Result.andThrough(async v => {
        let persistenceResult: Result.Result<void, WriteError> =
          await this.db.write({
            insert: {
              mconfigs: v.processedDashboard.insertMconfigs
            },
            insertOrUpdate: {
              dashboards: [v.processedDashboard.newDashboard],
              queries: v.processedDashboard.insertOrUpdateQueries
            },
            insertOrDoNothing: {
              queries: v.processedDashboard.insertOrDoNothingQueries
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed();
      }),
      Result.bind('newDashboardX', v =>
        getDashboardXCheckExistsAndAccess({
          db: this.db,
          dashboardId: v.processedDashboard.newDashboard.dashboardId,
          projectId: v.projectId,
          structId: v.bridge.structId,
          apiUserMember: v.apiUserMember,
          user: v.user
        })
      ),
      Result.map(
        (v): ToBackendEditDraftDashboardOutput => ({
          dashboard: v.newDashboardX
        })
      )
    );
  }
}
