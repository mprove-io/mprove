import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendSaveModifyChartRequestDto,
  ToBackendSaveModifyChartResponseDto
} from '#backend/controllers/charts/save-modify-chart/save-modify-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ChartTab,
  MconfigTab,
  MemberTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import {
  type RebuildStructOutput,
  rebuildStruct
} from '#backend/functions/blockml/rebuild-struct/rebuild-struct';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { getBranchBridgesForRebuild } from '#backend/functions/db/bridges/get-branch-bridges-for-rebuild/get-branch-bridges-for-rebuild';
import { chartApiToTab } from '#backend/functions/db/charts/chart-api-to-tab/chart-api-to-tab';
import { chartTabToApi } from '#backend/functions/db/charts/chart-tab-to-api/chart-tab-to-api';
import { checkChartPath } from '#backend/functions/db/charts/check-chart-path/check-chart-path';
import { getChartCheckExists } from '#backend/functions/db/charts/get-chart-check-exists/get-chart-check-exists';
import { getChartsCatalog } from '#backend/functions/db/charts/get-charts-catalog/get-charts-catalog';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { mconfigApiToTab } from '#backend/functions/db/mconfigs/mconfig-api-to-tab/mconfig-api-to-tab';
import { mconfigTabToApi } from '#backend/functions/db/mconfigs/mconfig-tab-to-api/mconfig-tab-to-api';
import {
  type PrepStoreMconfigQueryOutput,
  prepStoreMconfigQuery
} from '#backend/functions/db/mconfigs/prep-store-mconfig-query/prep-store-mconfig-query';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelCheckExistsAndAccess } from '#backend/functions/db/models/get-model-check-exists-and-access/get-model-check-exists-and-access';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { queryApiToTab } from '#backend/functions/db/queries/query-api-to-tab/query-api-to-tab';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getReportSpaceFromFilePath } from '#backend/functions/get-report-space-from-file-path/get-report-space-from-file-path';
import { getTargetParentNodeId } from '#backend/functions/get-target-parent-node-id/get-target-parent-node-id';
import { makeChartFileText } from '#backend/functions/make-chart-file-text/make-chart-file-text';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckChartPathError } from '#common/types/backend/function-errors/check-chart-path-error';
import type { CheckProjectIsNotRestrictedError } from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import type { CheckRepoIdError } from '#common/types/backend/function-errors/check-repo-id-error';
import type { CheckUserIsNotRestrictedError } from '#common/types/backend/function-errors/check-user-is-not-restricted-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { GetChartCheckExistsError } from '#common/types/backend/function-errors/get-chart-check-exists-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveModifyChartOutput } from '#common/types/backend/routes/charts/save-modify-chart/save-modify-chart-output';
import type { Chart } from '#common/types/blockml/parts/chart/chart';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Tile } from '#common/types/blockml/parts/tile/tile';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';
import type { ToDiskMoveCatalogNodeOutput } from '#common/types/disk/routes/catalogs/move-catalog-node/move-catalog-node-output';

type PrepareRebuildPayload = {
  diskFiles: DiskCatalogFile[];
  selectedSpaceFilePath: string;
  modelIds: string[];
};

type AssembleChartResponsePayload = {
  apiUserMember: Member;
  modelApi: ModelX;
};

type PrepareChartFilePayload = {
  chartFileText: string;
  baseProject: BaseProject;
  currentChartSpace: string;
};

type PrepareChartFileMovePayload = {
  chartFileName: string;
  isSpaceChanged: boolean;
  targetChartFilePath: string;
  isChartPathChanged: boolean;
  isMoveChartRequired: boolean;
  finalChartFilePath: string;
};

type PrepareQueryPayload = {
  chartTile: Tile;
  chartApiMconfig: Mconfig;
  chartApiQuery: Query;
  newMconfig: MconfigTab;
  newQuery: QueryTab;
  isError: boolean;
};

type SaveChartPayload = {
  chart: ChartTab;
};

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveModifyChartController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendSaveModifyChart' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SaveModifyChart',
    description: 'Save changes to an existing chart'
  })
  @ApiOkResponse({
    type: ToBackendSaveModifyChartResponseDto
  })
  async saveModifyChart(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSaveModifyChartRequestDto
  ): Promise<BackendResultForOperation<'saveModifyChart'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        fromChartId: body.input.fromChartId,
        chartId: body.input.chartId,
        tileTitle: body.input.tileTitle,
        space: body.input.space,
        accessRoles: body.input.accessRoles,
        timezone: body.input.timezone
      }),
      Result.andThrough(async v => {
        let userRestrictionResult: Result.Result<
          void,
          CheckUserIsNotRestrictedError
        > = checkUserIsNotRestricted({
          user: v.user
        });

        if (Result.isFailure(userRestrictionResult)) {
          return userRestrictionResult;
        }

        let repoAccessResult: Result.Result<
          'session' | 'production' | 'dev',
          CheckRepoIdError
        > = await checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        });

        if (Result.isFailure(repoAccessResult)) {
          return repoAccessResult;
        }

        return Result.succeed();
      }),
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

        let projectRestrictionResult: Result.Result<
          void,
          CheckProjectIsNotRestrictedError
        > = await checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: userMember,
          repoId: v.repoId,
          cs: this.cs
        });

        if (Result.isFailure(projectRestrictionResult)) {
          return projectRestrictionResult;
        }

        if (userMember.isExplorer === false) {
          return Result.fail({
            code: 'BACKEND_MEMBER_IS_NOT_EXPLORER'
          });
        }

        return Result.succeed(userMember);
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
      Result.bind('existingChart', async v => {
        let existingChartResult: Result.Result<
          ChartTab,
          GetChartCheckExistsError
        > = await getChartCheckExists({
          db: this.db,
          structId: v.bridge.structId,
          chartId: v.chartId,
          userMember: v.userMember,
          user: v.user
        });

        if (Result.isFailure(existingChartResult)) {
          return existingChartResult;
        }

        let existingChart: ChartTab = existingChartResult.value;

        if (v.userMember.isAdmin === false && v.userMember.isEditor === false) {
          let chartPathResult: Result.Result<void, CheckChartPathError> =
            checkChartPath({
              userAlias: v.user.alias,
              filePath: existingChart.filePath
            });

          if (Result.isFailure(chartPathResult)) {
            return chartPathResult;
          }
        }

        return Result.succeed(existingChart);
      }),
      Result.bind('mconfig', v =>
        this.db.mconfigs.findFirstCheckExists({
          where: and(
            eq(mconfigsTable.mconfigId, v.existingChart.tiles[0].mconfigId),
            eq(mconfigsTable.structId, v.bridge.structId)
          )
        })
      ),
      Result.bind('model', v =>
        getModelCheckExistsAndAccess({
          structId: v.bridge.structId,
          modelId: v.mconfig.modelId,
          userMember: v.userMember,
          db: this.db
        })
      ),
      Result.bind('prepareChartFilePayload', async v => {
        let chartFileText: string = makeChartFileText({
          mconfig: mconfigTabToApi({
            mconfig: v.mconfig,
            modelFields: v.model.fields
          }),
          tileTitle: v.tileTitle,
          chartId: v.chartId,
          accessRoles: v.accessRoles
        });

        let baseProject: BaseProject = projectTabToBaseProject({
          tabService: this.tabService,
          project: v.project
        });

        let currentChartSpace: string = getReportSpaceFromFilePath({
          filePath: v.existingChart.filePath,
          spaces: v.currentStruct.spaces
        });

        let prepareChartFilePayload: PrepareChartFilePayload = {
          chartFileText: chartFileText,
          baseProject: baseProject,
          currentChartSpace: currentChartSpace
        };

        if (
          prepareChartFilePayload.currentChartSpace !== v.space &&
          v.userMember.isAdmin === false &&
          v.userMember.isEditor === false
        ) {
          return Result.fail({
            code: 'BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN'
          });
        }

        return Result.succeed(prepareChartFilePayload);
      }),
      Result.bind('prepareChartFileMovePayload', async v => {
        let chartFileName: string = `${v.chartId}${'.chart' satisfies FileExtension}`;

        let isSpaceChanged: boolean =
          v.prepareChartFilePayload.currentChartSpace !== v.space;

        let targetChartFilePath: string = v.existingChart.filePath;

        if (isSpaceChanged) {
          let targetParentNodeId: string = getTargetParentNodeId({
            projectId: v.projectId,
            mproveDirValue: v.currentStruct.mproveConfig.mproveDirValue,
            userAlias: v.user.alias,
            space: v.space,
            spaces: v.currentStruct.spaces,
            targetFolder: 'charts'
          });

          targetChartFilePath = `${targetParentNodeId}/${chartFileName}`;
        }

        let isChartPathChanged: boolean =
          v.existingChart.filePath !== targetChartFilePath;

        let isMoveChartRequired: boolean = isSpaceChanged && isChartPathChanged;

        let finalChartFilePath: string = isMoveChartRequired
          ? targetChartFilePath
          : v.existingChart.filePath;

        let prepareChartFileMovePayload: PrepareChartFileMovePayload = {
          chartFileName: chartFileName,
          isSpaceChanged: isSpaceChanged,
          targetChartFilePath: targetChartFilePath,
          isChartPathChanged: isChartPathChanged,
          isMoveChartRequired: isMoveChartRequired,
          finalChartFilePath: finalChartFilePath
        };

        if (prepareChartFileMovePayload.isMoveChartRequired) {
          let toDiskMoveCatalogNodeOutput: Result.Result<
            ToDiskMoveCatalogNodeOutput,
            SendToDiskError
          > = await this.rpcService.sendToDisk({
            request: {
              operation: 'moveCatalogNode',
              traceId: body.traceId,
              input: {
                baseProject: v.prepareChartFilePayload.baseProject,
                repoId: v.repoId,
                branch: v.branchId,
                fromNodeId: v.existingChart.filePath,
                toNodeId: prepareChartFileMovePayload.targetChartFilePath
              }
            }
          });

          if (Result.isFailure(toDiskMoveCatalogNodeOutput)) {
            return toDiskMoveCatalogNodeOutput;
          }
        }

        return Result.succeed(prepareChartFileMovePayload);
      }),
      Result.bind('diskSaveFileOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'saveFile',
            traceId: body.traceId,
            input: {
              baseProject: v.prepareChartFilePayload.baseProject,
              repoId: v.repoId,
              branch: v.branchId,
              fileNodeId: v.prepareChartFileMovePayload.finalChartFilePath,
              userAlias: v.user.alias,
              content: v.prepareChartFilePayload.chartFileText
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
        let diskFiles: DiskCatalogFile[] = v.diskSaveFileOutput.files.filter(
          file =>
            file.fileNodeId === v.prepareChartFileMovePayload.finalChartFilePath
        );

        let selectedSpaceFilePath: string = v.currentStruct.spaces.find(
          x => x.space === v.space
        )?.filePath;

        if (isDefined(selectedSpaceFilePath)) {
          let spaceDiskFile: DiskCatalogFile = v.diskSaveFileOutput.files.find(
            file => file.fileNodeId === selectedSpaceFilePath
          );

          if (isDefined(spaceDiskFile)) {
            diskFiles.push(spaceDiskFile);
          }
        }

        let modelIds: string[] = [v.mconfig.modelId];

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
      Result.bind('apiChart', async v => {
        let apiChartResult: Result.Result<Chart, never> = Result.succeed(
          v.rebuild.charts.find(x => x.chartId === v.chartId)
        );

        if (Result.isFailure(apiChartResult)) {
          return apiChartResult;
        }

        let apiChart: Chart = apiChartResult.value;

        if (isUndefined(apiChart)) {
          await retry(
            async () =>
              await this.db.drizzle.transaction(async tx => {
                await tx
                  .delete(chartsTable)
                  .where(
                    and(
                      eq(chartsTable.chartId, v.chartId),
                      eq(chartsTable.structId, v.bridge.structId)
                    )
                  );
              }),
            getRetryOption(this.cs, this.logger)
          );

          let fileIdAr: string[] =
            v.prepareChartFileMovePayload.finalChartFilePath.split('/');

          fileIdAr.shift();

          let filePath: string = fileIdAr.join('/');

          return Result.fail({
            code: 'BACKEND_MODIFY_CHART_FAIL',
            displayData: {
              encodedFileId: encodeFilePath({ filePath: filePath }),
              structErrors: v.rebuild.struct.errors
            }
          });
        }

        return Result.succeed(apiChart);
      }),
      Result.bind('prepareQueryPayload', async v => {
        let chartTile: Tile = v.apiChart.tiles[0];

        let chartApiMconfig: Mconfig = v.rebuild.mconfigs.find(
          x => x.mconfigId === chartTile.mconfigId
        );

        let chartApiQuery: Query = v.rebuild.queries.find(
          x => x.queryId === chartTile.queryId
        );

        let newMconfig: MconfigTab = mconfigApiToTab({
          apiMconfig: chartApiMconfig
        });

        let newQuery: QueryTab = queryApiToTab({
          apiQuery: chartApiQuery
        });

        let isError: boolean = false;

        let prepareQueryPayload: PrepareQueryPayload = {
          chartTile: chartTile,
          chartApiMconfig: chartApiMconfig,
          chartApiQuery: chartApiQuery,
          newMconfig: newMconfig,
          newQuery: newQuery,
          isError: isError
        };

        if (v.model.type === 'Store') {
          let prepStoreMconfigQueryOutput: Result.Result<
            PrepStoreMconfigQueryOutput,
            PrepStoreMconfigQueryError
          > = await prepStoreMconfigQuery({
            struct: v.rebuild.struct,
            project: v.project,
            envId: v.envId,
            mconfigParentType: 'Chart',
            mconfigParentId: v.chartId,
            model: v.model,
            mconfig: prepareQueryPayload.newMconfig,
            metricsStartDateYYYYMMDD: undefined,
            metricsEndDateYYYYMMDD: undefined,
            db: this.db
          });

          if (Result.isFailure(prepStoreMconfigQueryOutput)) {
            return prepStoreMconfigQueryOutput;
          }

          let mqe: {
            isError: boolean;
            newMconfig: MconfigTab;
            newQuery: QueryTab;
          } = prepStoreMconfigQueryOutput.value;

          prepareQueryPayload.newMconfig = mqe.newMconfig;

          prepareQueryPayload.newQuery = mqe.newQuery;

          prepareQueryPayload.isError = mqe.isError;
        }

        return Result.succeed(prepareQueryPayload);
      }),
      Result.bind('saveChartPayload', async v => {
        let chart: ChartTab = chartApiToTab({
          apiChart: v.apiChart,
          chartType: v.prepareQueryPayload.chartApiMconfig.chart.type
        });

        chart.tiles[0].mconfigId = v.prepareQueryPayload.newMconfig.mconfigId;

        chart.tiles[0].queryId = v.prepareQueryPayload.newMconfig.queryId;

        let saveChartPayload: SaveChartPayload = { chart: chart };

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

                    await this.db.txWriteUnwrap({
                      tx: tx,
                      insert: {
                        mconfigs: [v.prepareQueryPayload.newMconfig]
                      },
                      insertOrUpdate: {
                        charts: [saveChartPayload.chart],
                        queries:
                          v.prepareQueryPayload.isError === true
                            ? [v.prepareQueryPayload.newQuery]
                            : []
                      },
                      insertOrDoNothing: {
                        queries:
                          v.prepareQueryPayload.isError === false
                            ? [v.prepareQueryPayload.newQuery]
                            : []
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
      }),
      Result.bind('query', v =>
        this.db.queries.findFirst({
          where: and(
            eq(queriesTable.queryId, v.prepareQueryPayload.newQuery.queryId),
            eq(queriesTable.projectId, v.prepareQueryPayload.newQuery.projectId)
          )
        })
      ),
      Result.bind('assembleChartResponsePayload', v => {
        let apiUserMember: Member = memberTabToApi({
          member: v.userMember
        });

        let modelApi: ModelX = modelTabToApi({
          model: v.model,
          hasAccess: checkModelAccess({
            member: v.userMember,
            modelAccessRoles: v.model.accessRolesCombined
          })
        });

        let assembleChartResponsePayload: AssembleChartResponsePayload = {
          apiUserMember: apiUserMember,
          modelApi: modelApi
        };

        return Result.succeed(assembleChartResponsePayload);
      }),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.bridge.structId)
        })
      ),
      Result.bind('chartsCatalog', v =>
        getChartsCatalog({
          db: this.db,
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          apiUserMember: v.assembleChartResponsePayload.apiUserMember,
          models: v.models,
          spaces: v.currentStruct.spaces
        })
      ),
      Result.map(
        (v): ToBackendSaveModifyChartOutput => ({
          chart: chartTabToApi({
            chart: v.saveChartPayload.chart,
            mconfigs: [
              mconfigTabToApi({
                mconfig: v.prepareQueryPayload.newMconfig,
                modelFields: v.assembleChartResponsePayload.modelApi.fields
              })
            ],
            queries: [
              queryTabToApi({
                query: v.query
              })
            ],
            member: v.assembleChartResponsePayload.apiUserMember,
            models: [v.assembleChartResponsePayload.modelApi],
            isAddMconfigAndQuery: true
          }),
          chartUnitDrafts: v.chartsCatalog.chartUnitDrafts,
          chartSpaceNodes: v.chartsCatalog.chartSpaceNodes
        })
      )
    );
  }
}
