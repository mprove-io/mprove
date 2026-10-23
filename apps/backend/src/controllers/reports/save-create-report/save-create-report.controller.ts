import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSaveCreateReportRequestDto,
  ToBackendSaveCreateReportResponseDto
} from '#backend/controllers/reports/save-create-report/save-create-report.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  MemberTab,
  ModelTab,
  ReportTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { getBranchBridgesForRebuild } from '#backend/functions/db/bridges/get-branch-bridges-for-rebuild/get-branch-bridges-for-rebuild';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getTargetParentNodeId } from '#backend/functions/get-target-parent-node-id/get-target-parent-node-id';
import { makeReportFileText } from '#backend/functions/make-report-file-text/make-report-file-text';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { RebuildStructOutput } from '#backend/services/blockml/blockml.service';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { ReportDataService } from '#backend/services/report-data/report-data.service';
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
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveCreateReportOutput } from '#common/types/backend/routes/reports/save-create-report/save-create-report-output';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Report } from '#common/types/blockml/parts/report/report';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

type ResolveReportDependenciesPayload = {
  metricIds: string[];
  cachedMetrics: ModelMetric[];
  modelIds: string[];
};

type PrepareReportFilePayload = {
  repFileText: string;
  parentNodeId: string;
  fileName: string;
  baseProject: BaseProject;
};

type PrepareRebuildPayload = {
  diskFiles: DiskCatalogFile[];
  selectedSpaceFilePath: string;
};

type SaveReportPayload = {
  report: ReportTab;
};

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveCreateReportController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private projectsService: ProjectsService,
    private structsService: StructsService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private reportsService: ReportsService,
    private sessionsService: SessionsService,
    private reportDataService: ReportDataService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendSaveCreateReport' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SaveCreateReport',
    description: 'Save a draft report'
  })
  @ApiOkResponse({
    type: ToBackendSaveCreateReportResponseDto
  })
  async saveCreateRep(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSaveCreateReportRequestDto
  ): Promise<BackendResultForOperation<'saveCreateReport'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        newReportId: body.input.newReportId,
        fromReportId: body.input.fromReportId,
        accessRoles: body.input.accessRoles,
        title: body.input.title,
        space: body.input.space,
        timeSpec: body.input.timeSpec,
        timeRangeFractionBrick: body.input.timeRangeFractionBrick,
        timezone: body.input.timezone,
        newReportFields: body.input.newReportFields,
        chart: body.input.chart
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
      Result.bind('fromReport', v =>
        this.reportsService.getReportCheckExistsAndAccess({
          projectId: v.projectId,
          reportId: v.fromReportId,
          structId: v.bridge.structId,
          user: v.user,
          userMember: v.userMember
        })
      ),
      Result.bind('currentStruct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('resolveReportDependenciesPayload', v => {
        let metricIds: string[] = [
          ...new Set(
            v.fromReport.rows.map(row => row.metricId).filter(x => isDefined(x))
          )
        ];

        let cachedMetrics: ModelMetric[] = v.currentStruct.metrics.filter(
          metric => metricIds.indexOf(metric.metricId) > -1
        );

        let modelIds: string[] = [
          ...new Set(
            cachedMetrics.map(x => x.modelId).filter(x => isDefined(x))
          ),
          ...v.fromReport.fields
            .filter(x => isDefined(x.storeModel))
            .map(x => x.storeModel)
        ];

        let resolveReportDependenciesPayload: ResolveReportDependenciesPayload =
          {
            metricIds: metricIds,
            cachedMetrics: cachedMetrics,
            modelIds: modelIds
          };

        return Result.succeed(resolveReportDependenciesPayload);
      }),
      Result.bind('cachedModels', async v =>
        v.resolveReportDependenciesPayload.modelIds.length === 0
          ? Result.succeed<ModelTab[]>([])
          : this.db.models.findMany({
              where: and(
                eq(modelsTable.structId, v.bridge.structId),
                inArray(
                  modelsTable.modelId,
                  v.resolveReportDependenciesPayload.modelIds
                )
              )
            })
      ),
      Result.bind('prepareReportFilePayload', v => {
        let repFileText: string = makeReportFileText({
          reportId: v.newReportId,
          accessRoles: v.accessRoles,
          title: v.title,
          rows: v.fromReport.rows,
          metrics: v.currentStruct.metrics,
          models: v.cachedModels,
          struct: v.currentStruct,
          newReportFields: v.newReportFields,
          chart: v.chart,
          caseSensitiveStringFilters:
            v.currentStruct.mproveConfig.caseSensitiveStringFilters,
          timezone: UTC
        });

        let parentNodeId: string = getTargetParentNodeId({
          projectId: v.projectId,
          mproveDirValue: v.currentStruct.mproveConfig.mproveDirValue,
          userAlias: v.user.alias,
          space: v.space,
          spaces: v.currentStruct.spaces,
          targetFolder: 'reports'
        });

        let fileName: string = `${v.newReportId}${'.report' satisfies FileExtension}`;

        let baseProject: BaseProject = projectTabToBaseProject({
          tabService: this.tabService,
          project: v.project
        });

        let prepareReportFilePayload: PrepareReportFilePayload = {
          repFileText: repFileText,
          parentNodeId: parentNodeId,
          fileName: fileName,
          baseProject: baseProject
        };

        return Result.succeed(prepareReportFilePayload);
      }),
      Result.bind('diskCreateFileOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'createFile',
            traceId: body.traceId,
            input: {
              baseProject: v.prepareReportFilePayload.baseProject,
              repoId: v.repoId,
              branch: v.branchId,
              userAlias: v.user.alias,
              parentNodeId: v.prepareReportFilePayload.parentNodeId,
              fileName: v.prepareReportFilePayload.fileName,
              fileText: v.prepareReportFilePayload.repFileText
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
        let diskFiles: DiskCatalogFile[] = v.diskCreateFileOutput.files.filter(
          file =>
            file.fileNodeId ===
            `${v.prepareReportFilePayload.parentNodeId}/${v.prepareReportFilePayload.fileName}`
        );

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

        let prepareRebuildPayload: PrepareRebuildPayload = {
          diskFiles: diskFiles,
          selectedSpaceFilePath: selectedSpaceFilePath
        };

        return Result.succeed(prepareRebuildPayload);
      }),
      Result.bind('rebuild', async v => {
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
          cachedMetrics: v.resolveReportDependenciesPayload.cachedMetrics
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
      Result.bind('apiReport', async v => {
        let apiReportResult: Result.Result<Report, never> = Result.succeed(
          v.rebuild.reports.find(x => x.reportId === v.newReportId)
        );

        if (Result.isFailure(apiReportResult)) {
          return apiReportResult;
        }

        let apiReport: Report = apiReportResult.value;

        if (isUndefined(apiReport)) {
          let fileId: string = `${v.prepareReportFilePayload.parentNodeId}/${v.prepareReportFilePayload.fileName}`;

          let fileIdAr: string[] = fileId.split('/');

          fileIdAr.shift();

          let filePath: string = fileIdAr.join('/');

          return Result.fail({
            code: 'BACKEND_CREATE_REPORT_FAIL',
            displayData: {
              encodedFileId: encodeFilePath({ filePath: filePath }),
              structErrors: v.rebuild.struct.errors
            }
          });
        }

        return Result.succeed(apiReport);
      }),
      Result.bind('saveReportPayload', async v => {
        v.apiReport.rows = v.fromReport.rows;

        let report: ReportTab = this.reportsService.apiToTab({
          apiReport: v.apiReport
        });

        let saveReportPayload: SaveReportPayload = { report: report };

        let persistenceResult: Result.Result<void, DbErrorToError> =
          await dbErrorToResult({
            action: async () => {
              await retry(
                async () =>
                  await this.db.drizzle.transaction(async tx => {
                    await tx
                      .delete(reportsTable)
                      .where(
                        and(
                          eq(reportsTable.draft, true),
                          eq(reportsTable.projectId, v.projectId),
                          eq(reportsTable.reportId, v.fromReportId),
                          eq(reportsTable.creatorId, v.user.userId)
                        )
                      );

                    await this.db.txWriteUnwrap({
                      tx: tx,
                      insert: {
                        reports: [saveReportPayload.report]
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

        return Result.succeed(saveReportPayload);
      }),
      Result.bind('apiUserMember', v =>
        Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind('apiFinalReport', v =>
        this.reportDataService.getReportData({
          report: v.saveReportPayload.report,
          traceId: v.traceId,
          project: v.project,
          apiUserMember: v.apiUserMember,
          userMember: v.userMember,
          user: v.user,
          envId: v.envId,
          struct: v.rebuild.struct,
          metrics: v.rebuild.struct.metrics,
          timeSpec: v.timeSpec,
          timeRangeFractionBrick: v.timeRangeFractionBrick,
          timezone: v.timezone
        })
      ),
      Result.bind('modelPartXs', v =>
        this.modelsService.getModelPartXs({
          structId: v.currentStruct.structId,
          apiUserMember: v.apiUserMember
        })
      ),
      Result.bind('reportsCatalog', v =>
        this.reportsService.getReportsCatalog({
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          userMember: v.userMember,
          apiUserMember: v.apiUserMember,
          spaces: v.currentStruct.spaces
        })
      ),
      Result.map(
        (v): ToBackendSaveCreateReportOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.currentStruct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.apiUserMember,
          report: v.apiFinalReport,
          reportUnitDrafts: v.reportsCatalog.reportUnitDrafts,
          reportSpaceNodes: v.reportsCatalog.reportSpaceNodes
        })
      )
    );
  }
}
