import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendSaveCreateDashboardRequestDto,
  ToBackendSaveCreateDashboardResponseDto
} from '#backend/controllers/dashboards/save-create-dashboard/save-create-dashboard.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { dashboardsTable } from '#backend/drizzle/postgres/tables/dashboards';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import {
  type RebuildStructOutput,
  rebuildStruct
} from '#backend/functions/blockml/rebuild-struct/rebuild-struct';
import { getBranchBridgesForRebuild } from '#backend/functions/db/bridges/get-branch-bridges-for-rebuild/get-branch-bridges-for-rebuild';
import { getDashboardXCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-x-check-exists-and-access/get-dashboard-x-check-exists-and-access';
import { getDashboardsCatalog } from '#backend/functions/db/dashboards/get-dashboards-catalog/get-dashboards-catalog';
import {
  type ProcessDashboardOutput,
  processDashboard
} from '#backend/functions/db/dashboards/process-dashboard/process-dashboard';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getTargetParentNodeId } from '#backend/functions/get-target-parent-node-id/get-target-parent-node-id';
import { makeDashboardFileText } from '#backend/functions/make-dashboard-file-text/make-dashboard-file-text';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { UTC } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckProjectIsNotRestrictedError } from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import type { CheckUserIsNotRestrictedError } from '#common/types/backend/function-errors/check-user-is-not-restricted-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { GetDashboardXCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-x-check-exists-and-access-error';
import type { ProcessDashboardError } from '#common/types/backend/function-errors/process-dashboard-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { Member } from '#common/types/backend/parts/member';
import type { TileX } from '#common/types/backend/parts/tile/tile-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveCreateDashboardOutput } from '#common/types/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-output';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

type PrepareRebuildPayload = {
  diskFiles: DiskCatalogFile[];
  selectedSpaceFilePath: string;
  modelIds: string[];
};

type PrepareDashboardFileCreationPayload = {
  parentNodeId: string;
  fileName: string;
  dashFileText: string;
  fromDashboardX: DashboardX;
};

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveCreateDashboardController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendSaveCreateDashboard' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SaveCreateDashboard',
    description: 'Save a new dashboard'
  })
  @ApiOkResponse({
    type: ToBackendSaveCreateDashboardResponseDto
  })
  async saveCreateDashboard(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSaveCreateDashboardRequestDto
  ): Promise<BackendResultForOperation<'saveCreateDashboard'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        newDashboardId: body.input.newDashboardId,
        fromDashboardId: body.input.fromDashboardId,
        dashboardTitle: body.input.dashboardTitle,
        space: body.input.space,
        accessRoles: body.input.accessRoles,
        tilesGrid: body.input.tilesGrid,
        timezone: body.input.timezone
      }),
      Result.andThrough(v => {
        let userRestrictionResult: Result.Result<
          void,
          CheckUserIsNotRestrictedError
        > = checkUserIsNotRestricted({
          user: v.user
        });

        if (Result.isFailure(userRestrictionResult)) {
          return userRestrictionResult;
        }

        return Result.succeed();
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
      Result.bind('userMember', async v => {
        let userMemberResult: Result.Result<
          MemberTab,
          DbMembersFindFirstCheckExistsError
        > = await this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        });

        if (Result.isFailure(userMemberResult)) {
          return userMemberResult;
        }

        let userMember: MemberTab = userMemberResult.value;

        if (userMember.isExplorer === false) {
          return Result.fail({
            code: 'BACKEND_MEMBER_IS_NOT_EXPLORER'
          });
        }

        return Result.succeed(userMember);
      }),
      Result.bind('apiUserMember', async v => {
        let apiUserMemberResult: Result.Result<Member, never> = Result.succeed(
          memberTabToApi({
            member: v.userMember
          })
        );

        if (Result.isFailure(apiUserMemberResult)) {
          return apiUserMemberResult;
        }

        let apiUserMember: Member = apiUserMemberResult.value;

        let projectRestrictionResult: Result.Result<
          void,
          CheckProjectIsNotRestrictedError
        > = await checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId,
          cs: this.cs
        });

        if (Result.isFailure(projectRestrictionResult)) {
          return projectRestrictionResult;
        }

        if (
          isDefined(v.space) &&
          v.userMember.isAdmin === false &&
          v.userMember.isEditor === false
        ) {
          return Result.fail({
            code: 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN'
          });
        }

        return Result.succeed(apiUserMember);
      }),
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
      Result.bind('prepareDashboardFileCreationPayload', async v => {
        let parentNodeId: string = getTargetParentNodeId({
          projectId: v.projectId,
          mproveDirValue: v.currentStruct.mproveConfig.mproveDirValue,
          userAlias: v.user.alias,
          space: v.space,
          spaces: v.currentStruct.spaces,
          targetFolder: 'dashboards'
        });

        let fileName: string = `${v.newDashboardId}${'.dashboard' satisfies FileExtension}`;

        let dashFileText: string;

        let fromDashboardX: DashboardX;

        let prepareDashboardFileCreationPayload: PrepareDashboardFileCreationPayload =
          {
            parentNodeId: parentNodeId,
            fileName: fileName,
            dashFileText: dashFileText,
            fromDashboardX: fromDashboardX
          };

        if (isDefined(v.fromDashboardId)) {
          let fromDashboardResult: Result.Result<
            DashboardX,
            GetDashboardXCheckExistsAndAccessError
          > = await getDashboardXCheckExistsAndAccess({
            db: this.db,
            dashboardId: v.fromDashboardId,
            structId: v.bridge.structId,
            apiUserMember: v.apiUserMember,
            projectId: v.projectId,
            user: v.user
          });

          if (Result.isFailure(fromDashboardResult)) {
            return fromDashboardResult;
          }

          prepareDashboardFileCreationPayload.fromDashboardX =
            fromDashboardResult.value;

          let yTiles: TileX[] = [];

          v.tilesGrid.forEach(freshTile => {
            let yTile =
              prepareDashboardFileCreationPayload.fromDashboardX.tiles.find(
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

          prepareDashboardFileCreationPayload.fromDashboardX.tiles = yTiles;

          let dashboardFileText: string = makeDashboardFileText({
            dashboard: prepareDashboardFileCreationPayload.fromDashboardX,
            newDashboardId: v.newDashboardId,
            newTitle: v.dashboardTitle,
            roles: v.accessRoles,
            caseSensitiveStringFilters:
              v.currentStruct.mproveConfig.caseSensitiveStringFilters,
            timezone: UTC
          });

          prepareDashboardFileCreationPayload.dashFileText = dashboardFileText;
        } else {
          let newDashboard: DashboardX = {
            structId: undefined,
            dashboardId: v.newDashboardId,
            draft: false,
            creatorId: undefined,
            filePath: undefined,
            content: undefined,
            accessRoles: undefined,
            accessRolesCombined: undefined,
            title: undefined,
            tiles: [],
            author: undefined,
            canEditOrDeleteDashboard: undefined,
            serverTs: undefined,
            extendedFilters: [],
            storeModels: [],
            fields: []
          };

          let dashboardFileText: string = makeDashboardFileText({
            dashboard: newDashboard,
            newDashboardId: v.newDashboardId,
            newTitle: v.dashboardTitle,
            roles: v.accessRoles,
            caseSensitiveStringFilters:
              v.currentStruct.mproveConfig.caseSensitiveStringFilters,
            timezone: UTC
          });

          prepareDashboardFileCreationPayload.dashFileText = dashboardFileText;
        }

        return Result.succeed(prepareDashboardFileCreationPayload);
      }),
      Result.bind('baseProject', v =>
        Result.succeed(
          projectTabToBaseProject({
            tabService: this.tabService,
            project: v.project
          })
        )
      ),
      Result.bind('diskCreateFileOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'createFile',
            traceId: body.traceId,
            input: {
              baseProject: v.baseProject,
              repoId: v.repoId,
              branch: v.branchId,
              parentNodeId: v.prepareDashboardFileCreationPayload.parentNodeId,
              fileName: v.prepareDashboardFileCreationPayload.fileName,
              fileText: v.prepareDashboardFileCreationPayload.dashFileText,
              userAlias: v.user.alias
            }
          }
        })
      ),
      Result.bind('branchBridges', v =>
        getBranchBridgesForRebuild({
          db: this.db,
          projectId: v.branch.projectId,
          repoId: v.branch.repoId,
          branchId: v.branch.branchId,
          envId: v.envId
        })
      ),
      Result.bind('prepareRebuildPayload', v => {
        let diskFiles: DiskCatalogFile[] = [
          v.diskCreateFileOutput.files.find(
            file =>
              file.fileNodeId ===
              `${v.prepareDashboardFileCreationPayload.parentNodeId}/${v.prepareDashboardFileCreationPayload.fileName}`
          )
        ];

        let selectedSpaceFilePath: string = v.currentStruct.spaces.find(
          x => x.space === v.space
        )?.filePath;

        if (isDefined(selectedSpaceFilePath)) {
          let spaceDiskFile: DiskCatalogFile =
            v.diskCreateFileOutput.files.find(
              file => file.fileNodeId === selectedSpaceFilePath
            );

          if (isDefined(spaceDiskFile)) {
            diskFiles.push(spaceDiskFile);
          }
        }

        let modelIds: string[] = [
          ...(
            (isDefined(v.fromDashboardId)
              ? v.prepareDashboardFileCreationPayload.fromDashboardX?.tiles
              : v.tilesGrid) ?? []
          ).map(tile => tile.modelId),
          ...(isDefined(v.fromDashboardId)
            ? v.prepareDashboardFileCreationPayload.fromDashboardX.fields
                .filter(x => isDefined(x.storeModel))
                .map(x => x.storeModel)
            : [])
        ];

        let prepareRebuildPayload: PrepareRebuildPayload = {
          diskFiles: diskFiles,
          selectedSpaceFilePath: selectedSpaceFilePath,
          modelIds: modelIds
        };

        return Result.succeed(prepareRebuildPayload);
      }),
      Result.bind('cachedModels', v =>
        this.db.models.findMany({
          where: and(
            eq(modelsTable.structId, v.bridge.structId),
            inArray(modelsTable.modelId, v.prepareRebuildPayload.modelIds)
          )
        })
      ),
      Result.bind('rebuild', async v => {
        let rebuildStructOutput: Result.Result<
          RebuildStructOutput,
          RebuildStructError
        > = await rebuildStruct({
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.repoId,
          structId: v.bridge.structId,
          diskFiles: v.prepareRebuildPayload.diskFiles,
          mproveDir: v.currentStruct.mproveConfig.mproveDirValue,
          skipDb: true,
          envId: v.envId,
          selectedGivens: [],
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
        });

        if (Result.isFailure(rebuildStructOutput)) {
          return rebuildStructOutput;
        }

        let rebuild: RebuildStructOutput = rebuildStructOutput.value;

        v.currentStruct.errors = [
          ...v.currentStruct.errors,
          ...rebuild.struct.errors
        ];

        let persistenceResult: Result.Result<void, WriteError> =
          await this.db.write({
            insertOrUpdate: {
              structs: [v.currentStruct],
              bridges: [...v.branchBridges]
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed(rebuild);
      }),
      Result.bind('newApiDashboard', async v => {
        let newApiDashboardResult: Result.Result<Dashboard, never> =
          Result.succeed(
            v.rebuild.dashboards.find(x => x.dashboardId === v.newDashboardId)
          );

        if (Result.isFailure(newApiDashboardResult)) {
          return newApiDashboardResult;
        }

        let newApiDashboard: Dashboard = newApiDashboardResult.value;

        if (isUndefined(newApiDashboard)) {
          let fileId: string = `${v.prepareDashboardFileCreationPayload.parentNodeId}/${v.prepareDashboardFileCreationPayload.fileName}`;

          let fileIdAr: string[] = fileId.split('/');

          fileIdAr.shift();

          let filePath: string = fileIdAr.join('/');

          return Result.fail({
            code: 'BACKEND_CREATE_DASHBOARD_FAIL',
            displayData: {
              encodedFileId: encodeFilePath({ filePath: filePath }),
              structErrors: v.rebuild.struct.errors
            }
          });
        }

        return Result.succeed(newApiDashboard);
      }),
      Result.andThrough(async v => {
        let processDashboardOutput: Result.Result<
          ProcessDashboardOutput,
          ProcessDashboardError
        > = await processDashboard({
          db: this.db,
          newApiDashboard: v.newApiDashboard,
          apiMconfigs: v.rebuild.mconfigs,
          apiQueries: v.rebuild.queries,
          apiModels: v.rebuild.models,
          fromDashboardX: v.prepareDashboardFileCreationPayload.fromDashboardX,
          isQueryCache: true,
          cachedQueries: [],
          cachedMconfigs: [],
          envId: v.envId,
          newDashboardId: v.newDashboardId,
          tempStruct: v.rebuild.struct,
          project: v.project
        });

        if (Result.isFailure(processDashboardOutput)) {
          return processDashboardOutput;
        }

        let processedDashboard: ProcessDashboardOutput =
          processDashboardOutput.value;

        let persistenceResult: Result.Result<void, DbErrorToError> =
          await dbErrorToResult({
            action: async () => {
              await retry(
                async () =>
                  await this.db.drizzle.transaction(async tx => {
                    if (isDefined(v.fromDashboardId)) {
                      await tx
                        .delete(dashboardsTable)
                        .where(
                          and(
                            eq(dashboardsTable.draft, true),
                            eq(dashboardsTable.dashboardId, v.fromDashboardId),
                            eq(dashboardsTable.structId, v.bridge.structId)
                          )
                        );
                    }

                    await this.db.txWriteUnwrap({
                      tx: tx,
                      insert: {
                        dashboards: [processedDashboard.newDashboard],
                        mconfigs: processedDashboard.insertMconfigs
                      },
                      insertOrUpdate: {
                        queries: processedDashboard.insertOrUpdateQueries
                      },
                      insertOrDoNothing: {
                        queries: processedDashboard.insertOrDoNothingQueries
                      }
                    });
                  }),
                getRetryOption(this.cs, this.logger)
              );
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed(processedDashboard);
      }),
      Result.bind('dashboardsCatalog', v =>
        getDashboardsCatalog({
          db: this.db,
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          apiUserMember: v.apiUserMember,
          spaces: v.currentStruct.spaces
        })
      ),
      Result.map(
        (v): ToBackendSaveCreateDashboardOutput => ({
          dashboardUnitDrafts: v.dashboardsCatalog.dashboardUnitDrafts,
          dashboardSpaceNodes: v.dashboardsCatalog.dashboardSpaceNodes
        })
      )
    );
  }
}
