import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendSaveCreateChartRequestDto,
  ToBackendSaveCreateChartResponseDto
} from '#backend/controllers/charts/save-create-chart/save-create-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import {
  type ModelEnt,
  modelsTable
} from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import {
  type RebuildStructOutput,
  rebuildStruct
} from '#backend/functions/blockml/rebuild-struct/rebuild-struct';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { getBranchBridgesForRebuild } from '#backend/functions/db/bridges/get-branch-bridges-for-rebuild/get-branch-bridges-for-rebuild';
import { chartApiToTab } from '#backend/functions/db/charts/chart-api-to-tab/chart-api-to-tab';
import { chartTabToApi } from '#backend/functions/db/charts/chart-tab-to-api/chart-tab-to-api';
import { getChartsCatalog } from '#backend/functions/db/charts/get-charts-catalog/get-charts-catalog';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { mconfigApiToTab } from '#backend/functions/db/mconfigs/mconfig-api-to-tab/mconfig-api-to-tab';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelCheckExistsAndAccess } from '#backend/functions/db/models/get-model-check-exists-and-access/get-model-check-exists-and-access';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { checkProjectIsNotRestricted } from '#backend/functions/db/projects/check-project-is-not-restricted/check-project-is-not-restricted';
import { queryApiToTab } from '#backend/functions/db/queries/query-api-to-tab/query-api-to-tab';
import { checkRepoId } from '#backend/functions/db/sessions/check-repo-id/check-repo-id';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
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
import type { CheckProjectIsNotRestrictedError } from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import type { CheckUserIsNotRestrictedError } from '#common/types/backend/function-errors/check-user-is-not-restricted-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveCreateChartOutput } from '#common/types/backend/routes/charts/save-create-chart/save-create-chart-output';
import type { Chart } from '#common/types/blockml/parts/chart/chart';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Tile } from '#common/types/blockml/parts/tile/tile';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

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
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
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
      Result.andThrough(v =>
        getModelCheckExistsAndAccess({
          structId: v.bridge.structId,
          modelId: v.mconfig.modelId,
          userMember: v.userMember,
          db: this.db
        })
      ),
      Result.bind('prepareChartFilePayload', v => {
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

        let baseProject: BaseProject = projectTabToBaseProject({
          tabService: this.tabService,
          project: v.project
        });

        let prepareChartFilePayload: PrepareChartFilePayload = {
          parentNodeId: parentNodeId,
          fileName: fileName,
          chartFileText: chartFileText,
          baseProject: baseProject
        };

        return Result.succeed(prepareChartFilePayload);
      }),
      Result.bind('diskCreateFileOutput', v =>
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
          overrideTimezone: undefined,
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
      }),
      Result.bind('saveChartPayload', async v => {
        let chartTile: Tile = v.apiChart.tiles[0];

        let apiMconfig: Mconfig = v.rebuild.mconfigs.find(
          x => x.mconfigId === chartTile.mconfigId
        );

        let apiQuery: Query = v.rebuild.queries.find(
          x => x.queryId === chartTile.queryId
        );

        let newMconfig: MconfigTab = mconfigApiToTab({
          apiMconfig: apiMconfig
        });

        let newQuery: QueryTab = queryApiToTab({
          apiQuery: apiQuery
        });

        let chart: ChartTab = chartApiToTab({
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

                    await this.db.txWriteUnwrap({
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
      }),
      Result.bind('models', v =>
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
                : this.db.models.entToTab({
                    ent: x as ModelEnt
                  })
            )
          )
      ),
      Result.bind('apiUserMember', v =>
        Result.succeed(
          memberTabToApi({
            member: v.userMember
          })
        )
      ),
      Result.bind('chartsCatalog', v =>
        getChartsCatalog({
          db: this.db,
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
          chart: chartTabToApi({
            chart: v.saveChartPayload.chart,
            mconfigs: [],
            queries: [],
            member: v.apiUserMember,
            models: v.models.map(model =>
              modelTabToApi({
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
