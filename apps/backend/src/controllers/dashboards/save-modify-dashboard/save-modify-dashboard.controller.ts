import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSaveModifyDashboardRequestDto,
  ToBackendSaveModifyDashboardResponseDto
} from '#backend/controllers/dashboards/save-modify-dashboard/save-modify-dashboard.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { PackerOutput } from '#backend/drizzle/postgres/drizzle-packer';
import type {
  BranchTab,
  BridgeTab,
  DashboardTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getReportSpaceFromFilePath } from '#backend/functions/get-report-space-from-file-path/get-report-space-from-file-path';
import { getTargetParentNodeId } from '#backend/functions/get-target-parent-node-id/get-target-parent-node-id';
import { makeDashboardFileText } from '#backend/functions/make-dashboard-file-text/make-dashboard-file-text';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { RebuildStructOutput } from '#backend/services/blockml/blockml.service';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import type { DashboardsCatalog } from '#backend/services/db/dashboards/dashboards.service';
import {
  DashboardsService,
  type ProcessDashboardOutput
} from '#backend/services/db/dashboards/dashboards.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { UTC } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendMemberIsNotEditorOrAdminError } from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import type { BackendMemberIsNotExplorerError } from '#common/types/backend/errors/backend-member-is-not-explorer-error';
import type { BackendModifyDashboardFailError } from '#common/types/backend/errors/backend-modify-dashboard-fail-error';
import type { CheckProjectIsNotRestrictedError } from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import type { CheckUserIsNotRestrictedError } from '#common/types/backend/function-errors/check-user-is-not-restricted-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetBranchBridgesForRebuildError } from '#common/types/backend/function-errors/get-branch-bridges-for-rebuild-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetDashboardCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-error';
import type { GetDashboardXCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-x-check-exists-and-access-error';
import type { GetDashboardsCatalogError } from '#common/types/backend/function-errors/get-dashboards-catalog-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetModelCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { ProcessDashboardError } from '#common/types/backend/function-errors/process-dashboard-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { Member } from '#common/types/backend/parts/member';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { TileX } from '#common/types/backend/parts/tile/tile-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveModifyDashboardOutput } from '#common/types/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-output';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';
import type { ToDiskMoveCatalogNodeOutput } from '#common/types/disk/routes/catalogs/move-catalog-node/move-catalog-node-output';
import type { ToDiskSaveFileOutput } from '#common/types/disk/routes/files/save-file/save-file-output';

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

type PrepareRebuildPayload = {
  diskFiles: DiskCatalogFile[];
  selectedSpaceFilePath: string;
  modelIds: string[];
};

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveModifyDashboardController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private structsService: StructsService,
    private rpcService: RpcService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private dashboardsService: DashboardsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
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
        > = this.usersService.checkUserIsNotRestricted({ user: v.user });

        if (Result.isFailure(userRestrictionResult)) {
          return userRestrictionResult;
        }

        return Result.succeed();
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.user.userId),
              eq(membersTable.projectId, v.projectId)
            )
          })
      ),
      Result.bind(
        'apiUserMember',
        async (
          v
        ): Result.ResultAsync<
          Member,
          CheckProjectIsNotRestrictedError | BackendMemberIsNotExplorerError
        > => {
          let apiUserMemberResult: Result.Result<Member, never> =
            Result.succeed(
              this.membersService.tabToApi({ member: v.userMember })
            );

          if (Result.isFailure(apiUserMemberResult)) {
            return apiUserMemberResult;
          }

          let apiUserMember: Member = apiUserMemberResult.value;

          let projectRestrictionResult: Result.Result<
            void,
            CheckProjectIsNotRestrictedError
          > = await this.projectsService.checkProjectIsNotRestricted({
            projectId: v.projectId,
            userMember: v.userMember,
            repoId: v.repoId
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
        }
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.db.branches.findFirstCheckExists({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              eq(branchesTable.repoId, v.repoId),
              eq(branchesTable.branchId, v.branchId)
            )
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.db.bridges.findFirstCheckExists({
            where: and(
              eq(bridgesTable.projectId, v.branch.projectId),
              eq(bridgesTable.repoId, v.branch.repoId),
              eq(bridgesTable.branchId, v.branch.branchId),
              eq(bridgesTable.envId, v.envId)
            )
          })
      ),
      Result.bind(
        'currentStruct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExists({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'fromDashboardX',
        (
          v
        ): Result.ResultAsync<
          DashboardX,
          GetDashboardXCheckExistsAndAccessError
        > =>
          this.dashboardsService.getDashboardXCheckExistsAndAccess({
            dashboardId: v.fromDashboardId,
            structId: v.bridge.structId,
            apiUserMember: v.apiUserMember,
            projectId: v.projectId,
            user: v.user
          })
      ),
      Result.bind(
        'toDashboard',
        (
          v
        ): Result.ResultAsync<
          DashboardTab,
          GetDashboardCheckExistsAndAccessError
        > =>
          this.dashboardsService.getDashboardCheckExistsAndAccess({
            structId: v.bridge.structId,
            dashboardId: v.toDashboardId,
            userMember: v.userMember,
            user: v.user
          })
      ),
      Result.bind(
        'prepareDashboardFileUpdatePayload',
        async (
          v
        ): Result.ResultAsync<
          PrepareDashboardFileUpdatePayload,
          GetModelCheckExistsAndAccessError
        > => {
          let currentDashboardSpace: string = getReportSpaceFromFilePath({
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
            > = await this.modelsService.getModelCheckExistsAndAccess({
              structId: v.bridge.structId,
              modelId: v.newTile.mconfig.modelId,
              userMember: v.userMember
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
        }
      ),
      Result.bind(
        'baseProject',
        async (
          v
        ): Result.ResultAsync<
          BaseProject,
          BackendMemberIsNotEditorOrAdminError
        > => {
          let baseProjectResult: Result.Result<BaseProject, never> =
            Result.succeed(
              this.tabService.projectTabToBaseProject({
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
        }
      ),
      Result.bind(
        'prepareDashboardFileMovePayload',
        async (
          v
        ): Result.ResultAsync<
          PrepareDashboardFileMovePayload,
          SendToDiskError
        > => {
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

          let prepareDashboardFileMovePayload: PrepareDashboardFileMovePayload =
            {
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
        }
      ),
      Result.bind(
        'diskSaveFileOutput',
        (v): Result.ResultAsync<ToDiskSaveFileOutput, SendToDiskError> =>
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
      Result.bind(
        'branchBridges',
        (v): Result.ResultAsync<BridgeTab[], GetBranchBridgesForRebuildError> =>
          this.bridgesService.getBranchBridgesForRebuild({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'prepareRebuildPayload',
        (v): Result.Result<PrepareRebuildPayload, never> => {
          let diskFiles: DiskCatalogFile[] = [
            v.diskSaveFileOutput.files.find(
              file =>
                file.fileNodeId ===
                v.prepareDashboardFileMovePayload.finalDashboardFilePath
            )
          ];

          let selectedSpaceFilePath: string = v.currentStruct.spaces.find(
            x =>
              x.space ===
              v.prepareDashboardFileUpdatePayload.targetDashboardSpace
          )?.filePath;

          if (isDefined(selectedSpaceFilePath)) {
            let spaceDiskFile: DiskCatalogFile =
              v.diskSaveFileOutput.files.find(
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

          return Result.succeed({
            diskFiles: diskFiles,
            selectedSpaceFilePath: selectedSpaceFilePath,
            modelIds: modelIds
          });
        }
      ),
      Result.bind(
        'cachedModels',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.models.findMany({
            where: and(
              eq(modelsTable.structId, v.bridge.structId),
              inArray(modelsTable.modelId, v.prepareRebuildPayload.modelIds)
            )
          })
      ),
      Result.bind(
        'rebuild',
        async (
          v
        ): Result.ResultAsync<
          RebuildStructOutput,
          RebuildStructError | DbErrorToError
        > => {
          let rebuildStructOutput: Result.Result<
            RebuildStructOutput,
            RebuildStructError
          > = await this.blockmlService.rebuildStruct({
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
            cachedMetrics: []
          });

          if (Result.isFailure(rebuildStructOutput)) {
            return rebuildStructOutput;
          }

          let rebuild: RebuildStructOutput = rebuildStructOutput.value;

          v.currentStruct.errors = [
            ...v.currentStruct.errors,
            ...rebuild.struct.errors
          ];

          let persistenceResult: Result.Result<PackerOutput, WriteError> =
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
        }
      ),
      Result.bind(
        'newApiDashboard',
        async (
          v
        ): Result.ResultAsync<Dashboard, BackendModifyDashboardFailError> => {
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
        }
      ),
      Result.bind(
        'processedDashboard',
        async (
          v
        ): Result.ResultAsync<
          ProcessDashboardOutput,
          ProcessDashboardError | DbErrorToError
        > => {
          let processDashboardOutput: Result.Result<
            ProcessDashboardOutput,
            ProcessDashboardError
          > = await this.dashboardsService.processDashboard({
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

                      await this.db.packer.writeUnwrap({
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
        }
      ),
      Result.bind(
        'apiFinalDashboardX',
        (
          v
        ): Result.ResultAsync<
          DashboardX,
          GetDashboardXCheckExistsAndAccessError
        > =>
          this.dashboardsService.getDashboardXCheckExistsAndAccess({
            dashboardId: v.processedDashboard.newDashboard.dashboardId,
            structId: v.bridge.structId,
            apiUserMember: v.apiUserMember,
            projectId: v.projectId,
            user: v.user
          })
      ),
      Result.bind(
        'dashboardsCatalog',
        (v): Result.ResultAsync<DashboardsCatalog, GetDashboardsCatalogError> =>
          this.dashboardsService.getDashboardsCatalog({
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
