import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendCreateDraftDashboardRequestDto,
  ToBackendCreateDraftDashboardResponseDto
} from '#backend/controllers/dashboards/create-draft-dashboard/create-draft-dashboard.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getDashboardXCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-x-check-exists-and-access/get-dashboard-x-check-exists-and-access';
import { getDashboardsCatalog } from '#backend/functions/db/dashboards/get-dashboards-catalog/get-dashboards-catalog';
import { processDashboard } from '#backend/functions/db/dashboards/process-dashboard/process-dashboard';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { makeDashboardFileText } from '#backend/functions/make-dashboard-file-text/make-dashboard-file-text';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { DbService } from '#backend/services/db/db.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { HashService } from '#backend/services/hash/hash.service';
import { ParentService } from '#backend/services/parent/parent.service';
import { SpaceService } from '#backend/services/space/space.service';
import { UnitsService } from '#backend/services/units/units.service';
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
import type { BackendMconfigParentIdMismatchError } from '#common/types/backend/errors/backend-mconfig-parent-id-mismatch-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { TileX } from '#common/types/backend/parts/tile/tile-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateDraftDashboardOutput } from '#common/types/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-output';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

type PrepareDraftDashboardFilePayload = {
  yTiles: TileX[];
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
export class CreateDraftDashboardController {
  constructor(
    private modelsService: ModelsService,
    private usersService: UsersService,
    private membersService: MembersService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private parentService: ParentService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private db: DbService,
    private hashService: HashService,
    private unitsService: UnitsService,
    private spaceService: SpaceService
  ) {}

  @Post('api/ToBackendCreateDraftDashboard' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateDraftDashboard',
    description: 'Create a draft dashboard from an existing dashboard'
  })
  @ApiOkResponse({
    type: ToBackendCreateDraftDashboardResponseDto
  })
  async createDraftDashboard(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateDraftDashboardRequestDto
  ): Promise<BackendResultForOperation<'createDraftDashboard'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        oldDashboardId: body.input.oldDashboardId,
        newDashboardId: body.input.newDashboardId,
        newDashboardFields: body.input.newDashboardFields,
        tiles: body.input.tiles,
        timezone: body.input.timezone,
        isQueryCache: body.input.isQueryCache,
        cachedQueryMconfigIds: body.input.cachedQueryMconfigIds
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
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
        Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
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
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('fromDashboardX', v =>
        getDashboardXCheckExistsAndAccess({
          db: this.db,
          modelsService: this.modelsService,
          mconfigsService: this.mconfigsService,
          queriesService: this.queriesService,
          dashboardId: v.oldDashboardId,
          structId: v.bridge.structId,
          apiUserMember: v.apiUserMember,
          projectId: v.projectId,
          user: v.user
        })
      ),
      Result.bind('prepareDraftDashboardFilePayload', v => {
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

        let fileName: string = `${v.newDashboardId}${'.dashboard' satisfies FileExtension}`;

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

        let fileId: string = encodeFilePath({
          filePath: relativePath
        });

        let dashboardFileText: string = makeDashboardFileText({
          dashboard: v.fromDashboardX,
          newDashboardId: v.newDashboardId,
          newTitle: v.newDashboardId,
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

        let prepareDraftDashboardFilePayload: PrepareDraftDashboardFilePayload =
          {
            yTiles: yTiles,
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

        return Result.succeed(prepareDraftDashboardFilePayload);
      }),
      Result.bind('cachedModels', v =>
        this.db.models.findMany({
          where: and(
            eq(modelsTable.structId, v.bridge.structId),
            inArray(
              modelsTable.modelId,
              v.prepareDraftDashboardFilePayload.modelIds
            )
          )
        })
      ),
      Result.bind('selectedGivens', v =>
        this.usersService.getSelectedGivens({
          user: v.user,
          projectId: v.projectId
        })
      ),
      Result.bind('rebuild', v =>
        this.blockmlService.rebuildStruct({
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          structId: v.bridge.structId,
          diskFiles: v.prepareDraftDashboardFilePayload.diskFiles,
          mproveDir: v.currentStruct.mproveConfig.mproveDirValue,
          skipDb: true,
          envId: v.envId,
          selectedGivens: v.selectedGivens,
          overrideTimezone: v.timezone,
          isUseCache: true,
          cachedMproveConfig: v.currentStruct.mproveConfig,
          cachedModels: v.cachedModels,
          cachedMetrics: []
        })
      ),
      Result.bind('newApiDashboard', v =>
        Result.succeed(
          v.rebuild.dashboards.find(x => x.dashboardId === v.newDashboardId)
        )
      ),
      Result.andThrough(v =>
        isUndefined(v.newApiDashboard)
          ? Result.fail({
              code: 'BACKEND_CREATE_DRAFT_DASHBOARD_FAILED',
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
      Result.bind('cachedMconfigs', v =>
        this.db.mconfigs.findMany({
          where: and(
            eq(mconfigsTable.structId, v.bridge.structId),
            inArray(mconfigsTable.mconfigId, v.cachedQueryMconfigIds)
          )
        })
      ),
      Result.andThrough(v => {
        // Access was already checked for fromDashboardX; verify parent IDs here.
        let cachedMconfigParentCheckResult: Result.Result<
          void[],
          BackendMconfigParentIdMismatchError
        > = Result.sequence(
          v.cachedMconfigs,
          (x): Result.Result<void, BackendMconfigParentIdMismatchError> =>
            x.parentId !== v.fromDashboardX.dashboardId
              ? Result.fail({
                  code: 'BACKEND_MCONFIG_PARENT_ID_MISMATCH'
                })
              : Result.succeed()
        );

        if (Result.isFailure(cachedMconfigParentCheckResult)) {
          return cachedMconfigParentCheckResult;
        }

        return Result.succeed();
      }),
      Result.bind('cachedQueryIds', v =>
        Result.succeed(v.cachedMconfigs.map(x => x.queryId))
      ),
      Result.bind('cachedQueries', v =>
        this.db.queries.findMany({
          where: and(
            inArray(queriesTable.queryId, v.cachedQueryIds),
            eq(queriesTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('processedDashboard', v =>
        processDashboard({
          queriesService: this.queriesService,
          mconfigsService: this.mconfigsService,
          modelsService: this.modelsService,
          hashService: this.hashService,
          newApiDashboard: v.newApiDashboard,
          apiMconfigs: v.rebuild.mconfigs,
          apiQueries: v.rebuild.queries,
          apiModels: v.rebuild.models,
          fromDashboardX: v.fromDashboardX,
          isQueryCache: v.isQueryCache,
          cachedQueries: v.cachedQueries,
          cachedMconfigs: v.cachedMconfigs,
          envId: v.envId,
          newDashboardId: v.newDashboardId,
          tempStruct: v.rebuild.struct,
          project: v.project
        })
      ),
      Result.andThrough(async v => {
        let persistenceResult: Result.Result<void, WriteError> =
          await this.db.write({
            insert: {
              dashboards: [v.processedDashboard.newDashboard],
              mconfigs: v.processedDashboard.insertMconfigs
            },
            insertOrUpdate: {
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
          modelsService: this.modelsService,
          mconfigsService: this.mconfigsService,
          queriesService: this.queriesService,
          dashboardId: v.processedDashboard.newDashboard.dashboardId,
          projectId: v.projectId,
          structId: v.bridge.structId,
          apiUserMember: v.apiUserMember,
          user: v.user
        })
      ),
      Result.bind('dashboardsCatalog', v =>
        getDashboardsCatalog({
          db: this.db,
          unitsService: this.unitsService,
          spaceService: this.spaceService,
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          apiUserMember: v.apiUserMember,
          spaces: v.currentStruct.spaces
        })
      ),
      Result.map(
        (v): ToBackendCreateDraftDashboardOutput => ({
          dashboard: v.newDashboardX,
          dashboardUnitDrafts: v.dashboardsCatalog.dashboardUnitDrafts
        })
      )
    );
  }
}
