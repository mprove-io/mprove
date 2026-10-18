import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSaveCreateChartRequestDto,
  ToBackendSaveCreateChartResponseDto
} from '#backend/controllers/charts/save-create-chart/save-create-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  ChartTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  QueryTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { ModelEnt, modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getTargetParentNodeId } from '#backend/functions/get-target-parent-node-id/get-target-parent-node-id';
import { makeChartFileText } from '#backend/functions/make-chart-file-text/make-chart-file-text';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { RebuildStructOutput } from '#backend/services/blockml/blockml.service';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import type { ChartsCatalog } from '#backend/services/db/charts/charts.service';
import { ChartsService } from '#backend/services/db/charts/charts.service';
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
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendCreateChartFailError } from '#common/types/backend/errors/backend-create-chart-fail-error';
import type { BackendMemberIsNotEditorOrAdminError } from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import type { BackendMemberIsNotExplorerError } from '#common/types/backend/errors/backend-member-is-not-explorer-error';
import type { CheckProjectIsNotRestrictedError } from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import type { CheckUserIsNotRestrictedError } from '#common/types/backend/function-errors/check-user-is-not-restricted-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetChartsCatalogError } from '#common/types/backend/function-errors/get-charts-catalog-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { Member } from '#common/types/backend/parts/member';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveCreateChartOutput } from '#common/types/backend/routes/charts/save-create-chart/save-create-chart-output';
import type { Chart } from '#common/types/blockml/parts/chart/chart';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Tile } from '#common/types/blockml/parts/tile/tile';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';
import type { ToDiskCreateFileOutput } from '#common/types/disk/routes/files/create-file/create-file-output';

type PrepareChartFilePayload = {
  parentNodeId: string;
  fileName: string;
  chartFileText: string;
  baseProject: BaseProject;
};

type PrepareRebuildPayload = {
  diskFiles: DiskCatalogFile[];
  selectedSpaceFilePath: string;
  modelIds: string[];
};

type SaveChartPayload = {
  chartTile: Tile;
  apiMconfig: Mconfig;
  apiQuery: Query;
  newMconfig: MconfigTab;
  newQuery: QueryTab;
  chart: ChartTab;
};

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveCreateChartController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private chartsService: ChartsService,
    private branchesService: BranchesService,
    private rpcService: RpcService,
    private structsService: StructsService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendSaveCreateChart' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SaveCreateChart',
    description: 'Save a draft chart'
  })
  @ApiOkResponse({
    type: ToBackendSaveCreateChartResponseDto
  })
  async saveCreateChart(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSaveCreateChartRequestDto
  ): Promise<BackendResultForOperation<'saveCreateChart'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        fromChartId: body.input.fromChartId,
        newChartId: body.input.newChartId,
        tileTitle: body.input.tileTitle,
        space: body.input.space,
        accessRoles: body.input.accessRoles,
        mconfig: body.input.mconfig,
        envId: body.input.envId
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
          this.projectsService.getProjectCheckExists({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        async (
          v
        ): Result.ResultAsync<
          MemberTab,
          | GetMemberCheckExistsError
          | CheckProjectIsNotRestrictedError
          | BackendMemberIsNotExplorerError
          | BackendMemberIsNotEditorOrAdminError
        > => {
          let userMemberResult: Result.Result<
            MemberTab,
            GetMemberCheckExistsError
          > = await this.membersService.getMemberCheckExists({
            projectId: v.projectId,
            memberId: v.user.userId
          });

          if (Result.isFailure(userMemberResult)) {
            return userMemberResult;
          }

          let userMember: MemberTab = userMemberResult.value;

          let projectRestrictionResult: Result.Result<
            void,
            CheckProjectIsNotRestrictedError
          > = await this.projectsService.checkProjectIsNotRestricted({
            projectId: v.projectId,
            userMember: userMember,
            repoId: v.repoId
          });

          if (Result.isFailure(projectRestrictionResult)) {
            return projectRestrictionResult;
          }

          if (userMember.isExplorer === false) {
            return Result.fail({
              code: 'BACKEND_MEMBER_IS_NOT_EXPLORER'
            });
          }

          if (
            isDefined(v.space) &&
            userMember.isAdmin === false &&
            userMember.isEditor === false
          ) {
            return Result.fail({
              code: 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN'
            });
          }

          return Result.succeed(userMember);
        }
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExists({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
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
          this.bridgesService.getBridgeCheckExists({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
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
      Result.andThrough(v =>
        this.modelsService.getModelCheckExistsAndAccess({
          structId: v.bridge.structId,
          modelId: v.mconfig.modelId,
          userMember: v.userMember
        })
      ),
      Result.bind(
        'prepareChartFilePayload',
        (v): Result.Result<PrepareChartFilePayload, never> => {
          let parentNodeId: string = getTargetParentNodeId({
            projectId: v.projectId,
            mproveDirValue: v.currentStruct.mproveConfig.mproveDirValue,
            userAlias: v.user.alias,
            space: v.space,
            spaces: v.currentStruct.spaces,
            targetFolder: 'charts'
          });

          let fileName: string = `${v.newChartId}${'.chart' satisfies FileExtension}`;

          let chartFileText: string = makeChartFileText({
            mconfig: v.mconfig,
            tileTitle: v.tileTitle,
            chartId: v.newChartId,
            accessRoles: v.accessRoles
          });

          let baseProject: BaseProject =
            this.tabService.projectTabToBaseProject({
              project: v.project
            });

          return Result.succeed({
            parentNodeId: parentNodeId,
            fileName: fileName,
            chartFileText: chartFileText,
            baseProject: baseProject
          });
        }
      ),
      Result.bind(
        'diskCreateFileOutput',
        (v): Result.ResultAsync<ToDiskCreateFileOutput, SendToDiskError> =>
          this.rpcService.sendToDisk({
            request: {
              operation: 'createFile',
              traceId: body.traceId,
              input: {
                baseProject: v.prepareChartFilePayload.baseProject,
                repoId: v.repoId,
                branch: v.branchId,
                userAlias: v.user.alias,
                parentNodeId: v.prepareChartFilePayload.parentNodeId,
                fileName: v.prepareChartFilePayload.fileName,
                fileText: v.prepareChartFilePayload.chartFileText
              }
            }
          })
      ),
      Result.bind(
        'branchBridgeEnts',
        async (v): Result.ResultAsync<BridgeEnt[], never> => {
          let branchBridgeEnts: BridgeEnt[] =
            await this.db.drizzle.query.bridgesTable.findMany({
              where: and(
                eq(bridgesTable.projectId, v.branch.projectId),
                eq(bridgesTable.repoId, v.branch.repoId),
                eq(bridgesTable.branchId, v.branch.branchId)
              )
            });

          let bridgeInvalidationResult: Result.Result<void[], never> =
            Result.sequence(
              branchBridgeEnts,
              (x): Result.Result<void, never> => {
                if (x.envId !== v.envId) {
                  x.structId = EMPTY_STRUCT_ID;

                  x.needValidate = true;
                }

                return Result.succeed();
              }
            );

          if (Result.isFailure(bridgeInvalidationResult)) {
            return bridgeInvalidationResult;
          }

          return Result.succeed(branchBridgeEnts);
        }
      ),
      Result.bind(
        'prepareRebuildPayload',
        (v): Result.Result<PrepareRebuildPayload, never> => {
          let diskFiles: DiskCatalogFile[] = [
            v.diskCreateFileOutput.files.find(
              file =>
                file.fileNodeId ===
                `${v.prepareChartFilePayload.parentNodeId}/${v.prepareChartFilePayload.fileName}`
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

          let modelIds: string[] = [v.mconfig.modelId];

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
          this.db.drizzle.query.modelsTable
            .findMany({
              where: and(
                eq(modelsTable.structId, v.bridge.structId),
                inArray(modelsTable.modelId, v.prepareRebuildPayload.modelIds)
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                isUndefined(x)
                  ? Result.succeed(undefined)
                  : this.tabService.modelEntToTab({
                      modelEnt: x
                    })
              )
            )
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
            overrideTimezone: undefined,
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

          let persistenceResult: Result.Result<void, DbErrorToError> =
            await dbErrorToResult({
              action: async () => {
                await retry(
                  async () =>
                    await this.db.drizzle.transaction(async tx => {
                      await this.db.packer.write({
                        tx: tx,
                        insertOrUpdate: {
                          structs: [v.currentStruct],
                          bridges: [...v.branchBridgeEnts]
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

          return Result.succeed(rebuild);
        }
      ),
      Result.bind(
        'apiChart',
        async (v): Result.ResultAsync<Chart, BackendCreateChartFailError> => {
          let apiChartResult: Result.Result<Chart, never> = Result.succeed(
            v.rebuild.charts.find(x => x.chartId === v.newChartId)
          );

          if (Result.isFailure(apiChartResult)) {
            return apiChartResult;
          }

          let apiChart: Chart = apiChartResult.value;

          if (isUndefined(apiChart)) {
            let fileId: string = `${v.prepareChartFilePayload.parentNodeId}/${v.prepareChartFilePayload.fileName}`;

            let fileIdAr: string[] = fileId.split('/');

            fileIdAr.shift();

            let filePath: string = fileIdAr.join('/');

            return Result.fail({
              code: 'BACKEND_CREATE_CHART_FAIL',
              displayData: {
                encodedFileId: encodeFilePath({ filePath: filePath }),
                structErrors: v.rebuild.struct.errors
              }
            });
          }

          return Result.succeed(apiChart);
        }
      ),
      Result.bind(
        'saveChartPayload',
        async (v): Result.ResultAsync<SaveChartPayload, DbErrorToError> => {
          let chartTile: Tile = v.apiChart.tiles[0];

          let apiMconfig: Mconfig = v.rebuild.mconfigs.find(
            x => x.mconfigId === chartTile.mconfigId
          );

          let apiQuery: Query = v.rebuild.queries.find(
            x => x.queryId === chartTile.queryId
          );

          let newMconfig: MconfigTab = this.mconfigsService.apiToTab({
            apiMconfig: apiMconfig
          });

          let newQuery: QueryTab = this.queriesService.apiToTab({
            apiQuery: apiQuery
          });

          let chart: ChartTab = this.chartsService.apiToTab({
            apiChart: v.apiChart,
            chartType: apiMconfig.chart.type
          });

          let saveChartPayload: SaveChartPayload = {
            chartTile: chartTile,
            apiMconfig: apiMconfig,
            apiQuery: apiQuery,
            newMconfig: newMconfig,
            newQuery: newQuery,
            chart: chart
          };

          let persistenceResult: Result.Result<void, DbErrorToError> =
            await dbErrorToResult({
              action: async () => {
                await retry(
                  async () =>
                    await this.db.drizzle.transaction(async tx => {
                      await tx
                        .delete(chartsTable)
                        .where(
                          and(
                            eq(chartsTable.draft, true),
                            eq(chartsTable.chartId, v.fromChartId),
                            eq(chartsTable.structId, v.bridge.structId)
                          )
                        );

                      await this.db.packer.write({
                        tx: tx,
                        insert: {
                          charts: [saveChartPayload.chart],
                          mconfigs: [saveChartPayload.newMconfig]
                        },
                        insertOrDoNothing: {
                          queries: [saveChartPayload.newQuery]
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

          return Result.succeed(saveChartPayload);
        }
      ),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.drizzle
            .select({
              keyTag: modelsTable.keyTag,
              modelId: modelsTable.modelId,
              connectionId: modelsTable.connectionId,
              connectionType: modelsTable.connectionType,
              st: modelsTable.st
              // lt: {},
            })
            .from(modelsTable)
            .where(eq(modelsTable.structId, v.bridge.structId))
            .then(xs =>
              Result.sequence(xs, x =>
                isUndefined(x as ModelEnt)
                  ? Result.succeed(undefined)
                  : this.tabService.modelEntToTab({
                      modelEnt: x as ModelEnt
                    })
              )
            )
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'chartsCatalog',
        (v): Result.ResultAsync<ChartsCatalog, GetChartsCatalogError> =>
          this.chartsService.getChartsCatalog({
            projectId: v.projectId,
            structId: v.bridge.structId,
            user: v.user,
            apiUserMember: v.apiUserMember,
            models: v.models,
            spaces: v.currentStruct.spaces
          })
      ),
      Result.map(
        (v): ToBackendSaveCreateChartOutput => ({
          chart: this.chartsService.tabToApi({
            chart: v.saveChartPayload.chart,
            mconfigs: [],
            queries: [],
            member: v.apiUserMember,
            models: v.models.map(model =>
              this.modelsService.tabToApi({
                model: model,
                hasAccess: checkModelAccess({
                  member: v.userMember,
                  modelAccessRoles: model.accessRolesCombined
                })
              })
            ),
            isAddMconfigAndQuery: false
          }),
          chartUnitDrafts: v.chartsCatalog.chartUnitDrafts,
          chartSpaceNodes: v.chartsCatalog.chartSpaceNodes
        })
      )
    );
  }
}
