import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendSaveModifyDashboardRequestDto,
  ToBackendSaveModifyDashboardResponseDto
} from '#backend/controllers/dashboards/save-modify-dashboard/save-modify-dashboard.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { dashboardsTable } from '#backend/drizzle/postgres/tables/dashboards';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import {
  type RebuildStructOutput,
  rebuildStruct
} from '#backend/functions/blockml/rebuild-struct/rebuild-struct';
import { getBranchBridgesForRebuild } from '#backend/functions/db/bridges/get-branch-bridges-for-rebuild/get-branch-bridges-for-rebuild';
import { getDashboardCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-check-exists-and-access/get-dashboard-check-exists-and-access';
import { getDashboardXCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-x-check-exists-and-access/get-dashboard-x-check-exists-and-access';
import { getDashboardsCatalog } from '#backend/functions/db/dashboards/get-dashboards-catalog/get-dashboards-catalog';
import {
  type ProcessDashboardOutput,
  processDashboard
} from '#backend/functions/db/dashboards/process-dashboard/process-dashboard';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelCheckExistsAndAccess } from '#backend/functions/db/models/get-model-check-exists-and-access/get-model-check-exists-and-access';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getTargetParentNodeId } from '#backend/functions/get-target-parent-node-id/get-target-parent-node-id';
import { makeDashboardFileText } from '#backend/functions/make-dashboard-file-text/make-dashboard-file-text';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { getSpaceFromFilePath } from '#backend/functions/space/get-space-from-file-path/get-space-from-file-path';
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
import type { GetModelCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import type { ProcessDashboardError } from '#common/types/backend/function-errors/process-dashboard-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { Member } from '#common/types/backend/parts/member';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { TileX } from '#common/types/backend/parts/tile/tile-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveModifyDashboardOutput } from '#common/types/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-output';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';
import type { ToDiskMoveCatalogNodeOutput } from '#common/types/disk/routes/catalogs/move-catalog-node/move-catalog-node-output';

type PrepareRebuildPayload = {
  diskFiles: DiskCatalogFile[];
  selectedSpaceFilePath: string;
  modelIds: string[];
};

type PrepareDashboardFileUpdatePayload = {
  currentDashboardSpace: string;
  targetDashboardSpace: string;
  dashFileText: string;
};

type PrepareDashboardFileMovePayload = {
  dashboardFileName: string;
  isSpaceChanged: boolean;
  targetDashboardFilePath: string;
  isDashboardPathChanged: boolean;
  isMoveDashboardRequired: boolean;
  finalDashboardFilePath: string;
};

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveModifyDashboardController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendSaveModifyDashboard' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SaveModifyDashboard',
    description: 'Save changes to an existing dashboard'
  })
  @ApiOkResponse({
    type: ToBackendSaveModifyDashboardResponseDto
  })
  async saveModifyDashboard(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSaveModifyDashboardRequestDto
  ): Promise<BackendResultForOperation<'saveModifyDashboard'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        toDashboardId: body.input.toDashboardId,
        fromDashboardId: body.input.fromDashboardId,
        selectedTileTitle: body.input.selectedTileTitle,
        newTile: body.input.newTile,
        isReplaceTile: body.input.isReplaceTile,
        accessRoles: body.input.accessRoles,
        dashboardTitle: body.input.dashboardTitle,
        space: body.input.space,
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
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
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

        if (v.userMember.isExplorer === false) {
          return Result.fail({
            code: 'BACKEND_MEMBER_IS_NOT_EXPLORER'
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
      Result.bind('fromDashboardX', v =>
        getDashboardXCheckExistsAndAccess({
          db: this.db,
          dashboardId: v.fromDashboardId,
          structId: v.bridge.structId,
          apiUserMember: v.apiUserMember,
          projectId: v.projectId,
          user: v.user
        })
      ),
      Result.bind('toDashboard', v =>
        getDashboardCheckExistsAndAccess({
          db: this.db,
          structId: v.bridge.structId,
          dashboardId: v.toDashboardId,
          userMember: v.userMember,
          user: v.user
        })
      ),
      Result.bind('prepareDashboardFileUpdatePayload', async v => {
        let currentDashboardSpace: string = getSpaceFromFilePath({
          filePath: v.toDashboard.filePath,
          spaces: v.currentStruct.spaces
        });

        let targetDashboardSpace: string = isDefined(v.newTile)
          ? currentDashboardSpace
          : v.space;

        let dashFileText: string;

        let prepareDashboardFileUpdatePayload: PrepareDashboardFileUpdatePayload =
          {
            currentDashboardSpace: currentDashboardSpace,
            targetDashboardSpace: targetDashboardSpace,
            dashFileText: dashFileText
          };

        if (isDefined(v.newTile)) {
          let modelAccessResult: Result.Result<
            ModelTab,
            GetModelCheckExistsAndAccessError
          > = await getModelCheckExistsAndAccess({
            structId: v.bridge.structId,
            modelId: v.newTile.mconfig.modelId,
            userMember: v.userMember,
            db: this.db
          });

          if (Result.isFailure(modelAccessResult)) {
            return modelAccessResult;
          }

          v.newTile.mconfig.chart.title = v.newTile.title;

          let plateY: number = 0;

          v.fromDashboardX.tiles.forEach(tile => {
            plateY = plateY + tile.plateHeight;
          });

          v.newTile.plateY = plateY;

          if (v.isReplaceTile === true) {
            let oldTileIndex: number = v.fromDashboardX.tiles.findIndex(
              x => x.title === v.selectedTileTitle
            );

            let oldTile: TileX = v.fromDashboardX.tiles[oldTileIndex];

            v.newTile.plateWidth = oldTile.plateWidth;

            v.newTile.plateHeight = oldTile.plateHeight;

            v.newTile.plateX = oldTile.plateX;

            v.newTile.plateY = oldTile.plateY;

            v.fromDashboardX.tiles[oldTileIndex] = v.newTile;
          } else {
            v.fromDashboardX.tiles = [...v.fromDashboardX.tiles, v.newTile];
          }

          let dashboardFileText: string = makeDashboardFileText({
            dashboard: v.fromDashboardX,
            newDashboardId: v.fromDashboardX.dashboardId,
            newTitle: v.fromDashboardX.title,
            roles: v.fromDashboardX.accessRoles,
            caseSensitiveStringFilters:
              v.currentStruct.mproveConfig.caseSensitiveStringFilters,
            timezone: UTC
          });

          prepareDashboardFileUpdatePayload.dashFileText = dashboardFileText;
        } else {
          if (isDefined(v.tilesGrid)) {
            let yTiles: TileX[] = [];

            v.tilesGrid.forEach(freshTile => {
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
          }

          let dashboardFileText: string = makeDashboardFileText({
            dashboard: v.fromDashboardX,
            newDashboardId: v.toDashboardId,
            newTitle: v.dashboardTitle,
            roles: v.accessRoles,
            caseSensitiveStringFilters:
              v.currentStruct.mproveConfig.caseSensitiveStringFilters,
            timezone: UTC
          });

          prepareDashboardFileUpdatePayload.dashFileText = dashboardFileText;
        }

        return Result.succeed(prepareDashboardFileUpdatePayload);
      }),
      Result.bind('baseProject', async v => {
        let baseProjectResult: Result.Result<BaseProject, never> =
          Result.succeed(
            projectTabToBaseProject({
              tabService: this.tabService,
              project: v.project
            })
          );

        if (Result.isFailure(baseProjectResult)) {
          return baseProjectResult;
        }

        let baseProject: BaseProject = baseProjectResult.value;

        if (
          v.prepareDashboardFileUpdatePayload.currentDashboardSpace !==
            v.prepareDashboardFileUpdatePayload.targetDashboardSpace &&
          v.userMember.isAdmin === false &&
          v.userMember.isEditor === false
        ) {
          return Result.fail({
            code: 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN'
          });
        }

        return Result.succeed(baseProject);
      }),
      Result.bind('prepareDashboardFileMovePayload', async v => {
        let dashboardFileName: string = `${v.toDashboardId}${'.dashboard' satisfies FileExtension}`;

        let isSpaceChanged: boolean =
          v.prepareDashboardFileUpdatePayload.currentDashboardSpace !==
          v.prepareDashboardFileUpdatePayload.targetDashboardSpace;

        let targetDashboardFilePath: string = v.toDashboard.filePath;

        if (isSpaceChanged) {
          let targetParentNodeId: string = getTargetParentNodeId({
            projectId: v.projectId,
            mproveDirValue: v.currentStruct.mproveConfig.mproveDirValue,
            userAlias: v.user.alias,
            space: v.prepareDashboardFileUpdatePayload.targetDashboardSpace,
            spaces: v.currentStruct.spaces,
            targetFolder: 'dashboards'
          });

          targetDashboardFilePath = `${targetParentNodeId}/${dashboardFileName}`;
        }

        let isDashboardPathChanged: boolean =
          v.toDashboard.filePath !== targetDashboardFilePath;

        let isMoveDashboardRequired: boolean =
          isSpaceChanged && isDashboardPathChanged;

        let finalDashboardFilePath: string = isMoveDashboardRequired
          ? targetDashboardFilePath
          : v.toDashboard.filePath;

        let prepareDashboardFileMovePayload: PrepareDashboardFileMovePayload = {
          dashboardFileName: dashboardFileName,
          isSpaceChanged: isSpaceChanged,
          targetDashboardFilePath: targetDashboardFilePath,
          isDashboardPathChanged: isDashboardPathChanged,
          isMoveDashboardRequired: isMoveDashboardRequired,
          finalDashboardFilePath: finalDashboardFilePath
        };

        if (prepareDashboardFileMovePayload.isMoveDashboardRequired) {
          let toDiskMoveCatalogNodeOutput: Result.Result<
            ToDiskMoveCatalogNodeOutput,
            SendToDiskError
          > = await this.rpcService.sendToDisk({
            request: {
              operation: 'moveCatalogNode',
              traceId: body.traceId,
              input: {
                baseProject: v.baseProject,
                repoId: v.repoId,
                branch: v.branchId,
                fromNodeId: v.toDashboard.filePath,
                toNodeId:
                  prepareDashboardFileMovePayload.targetDashboardFilePath
              }
            }
          });

          if (Result.isFailure(toDiskMoveCatalogNodeOutput)) {
            return toDiskMoveCatalogNodeOutput;
          }
        }

        return Result.succeed(prepareDashboardFileMovePayload);
      }),
      Result.bind('diskSaveFileOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'saveFile',
            traceId: body.traceId,
            input: {
              baseProject: v.baseProject,
              repoId: v.repoId,
              branch: v.branchId,
              fileNodeId:
                v.prepareDashboardFileMovePayload.finalDashboardFilePath,
              userAlias: v.user.alias,
              content: v.prepareDashboardFileUpdatePayload.dashFileText
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
          v.diskSaveFileOutput.files.find(
            file =>
              file.fileNodeId ===
              v.prepareDashboardFileMovePayload.finalDashboardFilePath
          )
        ];

        let selectedSpaceFilePath: string = v.currentStruct.spaces.find(
          x =>
            x.space === v.prepareDashboardFileUpdatePayload.targetDashboardSpace
        )?.filePath;

        if (isDefined(selectedSpaceFilePath)) {
          let spaceDiskFile: DiskCatalogFile = v.diskSaveFileOutput.files.find(
            file => file.fileNodeId === selectedSpaceFilePath
          );

          if (isDefined(spaceDiskFile)) {
            diskFiles.push(spaceDiskFile);
          }
        }

        let modelIds: string[] = [
          ...(v.fromDashboardX?.tiles ?? []).map(tile => tile.modelId),
          ...v.fromDashboardX.fields
            .filter(x => isDefined(x.storeModel))
            .map(x => x.storeModel)
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
            v.rebuild.dashboards.find(x => x.dashboardId === v.toDashboardId)
          );

        if (Result.isFailure(newApiDashboardResult)) {
          return newApiDashboardResult;
        }

        let newApiDashboard: Dashboard = newApiDashboardResult.value;

        if (isUndefined(newApiDashboard)) {
          await retry(
            async () =>
              await this.db.drizzle.transaction(async tx => {
                await tx
                  .delete(dashboardsTable)
                  .where(
                    and(
                      eq(dashboardsTable.dashboardId, v.toDashboardId),
                      eq(dashboardsTable.structId, v.bridge.structId)
                    )
                  );
              }),
            getRetryOption(this.cs, this.logger)
          );

          let fileIdAr: string[] = v.toDashboard.filePath.split('/');

          fileIdAr.shift();

          let filePath: string = fileIdAr.join('/');

          return Result.fail({
            code: 'BACKEND_MODIFY_DASHBOARD_FAIL',
            displayData: {
              encodedFileId: encodeFilePath({ filePath: filePath }),
              structErrors: v.rebuild.struct.errors
            }
          });
        }

        return Result.succeed(newApiDashboard);
      }),
      Result.bind('processedDashboard', async v => {
        let processDashboardOutput: Result.Result<
          ProcessDashboardOutput,
          ProcessDashboardError
        > = await processDashboard({
          db: this.db,
          newApiDashboard: v.newApiDashboard,
          apiMconfigs: v.rebuild.mconfigs,
          apiQueries: v.rebuild.queries,
          apiModels: v.rebuild.models,
          fromDashboardX: v.fromDashboardX,
          isQueryCache: true,
          cachedQueries: [],
          cachedMconfigs: [],
          envId: v.envId,
          newDashboardId: v.newApiDashboard.dashboardId,
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
                    await tx
                      .delete(dashboardsTable)
                      .where(
                        and(
                          eq(dashboardsTable.draft, true),
                          eq(dashboardsTable.dashboardId, v.fromDashboardId),
                          eq(dashboardsTable.structId, v.bridge.structId)
                        )
                      );

                    await this.db.txWriteUnwrap({
                      tx: tx,
                      insert: {
                        mconfigs: processedDashboard.insertMconfigs
                      },
                      insertOrUpdate: {
                        dashboards: [processedDashboard.newDashboard],
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
      Result.bind('apiFinalDashboardX', v =>
        getDashboardXCheckExistsAndAccess({
          db: this.db,
          dashboardId: v.processedDashboard.newDashboard.dashboardId,
          structId: v.bridge.structId,
          apiUserMember: v.apiUserMember,
          projectId: v.projectId,
          user: v.user
        })
      ),
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
        (v): ToBackendSaveModifyDashboardOutput => ({
          dashboard: v.apiFinalDashboardX,
          dashboardUnitDrafts: v.dashboardsCatalog.dashboardUnitDrafts,
          dashboardSpaceNodes: v.dashboardsCatalog.dashboardSpaceNodes
        })
      )
    );
  }
}
