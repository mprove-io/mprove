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
  ToBackendSaveCreateReportRequestDto,
  ToBackendSaveCreateReportResponseDto
} from '#backend/controllers/reports/save-create-report/save-create-report.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  ReportTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getTargetParentNodeId } from '#backend/functions/get-target-parent-node-id/get-target-parent-node-id';
import { makeReportFileText } from '#backend/functions/make-report-file-text/make-report-file-text';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { RebuildStructOutput } from '#backend/services/blockml/blockml.service';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { ReportsCatalog } from '#backend/services/db/reports/reports.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { ReportDataService } from '#backend/services/report-data/report-data.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID, UTC } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendCreateReportFailError } from '#common/types/backend/errors/backend-create-report-fail-error';
import type { BackendMemberIsNotEditorOrAdminError } from '#common/types/backend/errors/backend-member-is-not-editor-or-admin-error';
import type { BackendMemberIsNotExplorerError } from '#common/types/backend/errors/backend-member-is-not-explorer-error';
import type { CheckProjectIsNotRestrictedError } from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import type { CheckUserIsNotRestrictedError } from '#common/types/backend/function-errors/check-user-is-not-restricted-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetReportCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';
import type { GetReportDataError } from '#common/types/backend/function-errors/get-report-data-error';
import type { GetReportsCatalogError } from '#common/types/backend/function-errors/get-reports-catalog-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSaveCreateReportOutput } from '#common/types/backend/routes/reports/save-create-report/save-create-report-output';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Report } from '#common/types/blockml/parts/report/report';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';
import type { ToDiskCreateFileOutput } from '#common/types/disk/routes/files/create-file/create-file-output';

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
    private branchesService: BranchesService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private reportsService: ReportsService,
    private sessionsService: SessionsService,
    private reportDataService: ReportDataService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        > = this.usersService.checkUserIsNotRestrictedResult({ user: v.user });

        if (Result.isFailure(userRestrictionResult)) {
          return userRestrictionResult;
        }

        return Result.succeed();
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExistsResult({
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
          > = await this.membersService.getMemberCheckExistsResult({
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
          > = await this.projectsService.checkProjectIsNotRestrictedResult({
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
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'fromReport',
        (
          v
        ): Result.ResultAsync<ReportTab, GetReportCheckExistsAndAccessError> =>
          this.reportsService.getReportCheckExistsAndAccessResult({
            projectId: v.projectId,
            reportId: v.fromReportId,
            structId: v.bridge.structId,
            user: v.user,
            userMember: v.userMember
          })
      ),
      Result.bind(
        'currentStruct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'resolveReportDependenciesPayload',
        (v): Result.Result<ResolveReportDependenciesPayload, never> => {
          let metricIds: string[] = [
            ...new Set(
              v.fromReport.rows
                .map(row => row.metricId)
                .filter(x => isDefined(x))
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

          return Result.succeed({
            metricIds: metricIds,
            cachedMetrics: cachedMetrics,
            modelIds: modelIds
          });
        }
      ),
      Result.bind(
        'cachedModels',
        async (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          v.resolveReportDependenciesPayload.modelIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.modelsTable
                .findMany({
                  where: and(
                    eq(modelsTable.structId, v.bridge.structId),
                    inArray(
                      modelsTable.modelId,
                      v.resolveReportDependenciesPayload.modelIds
                    )
                  )
                })
                .then(xs =>
                  Result.sequence(xs, x =>
                    isUndefined(x)
                      ? Result.succeed(undefined)
                      : this.tabService.modelEntToTabResult({
                          modelEnt: x
                        })
                  )
                )
      ),
      Result.bind(
        'prepareReportFilePayload',
        (v): Result.Result<PrepareReportFilePayload, never> => {
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

          let baseProject: BaseProject =
            this.tabService.projectTabToBaseProject({
              project: v.project
            });

          return Result.succeed({
            repFileText: repFileText,
            parentNodeId: parentNodeId,
            fileName: fileName,
            baseProject: baseProject
          });
        }
      ),
      Result.bind(
        'diskCreateFileOutput',
        (v): Result.ResultAsync<ToDiskCreateFileOutput, SendToDiskError> =>
          this.rpcService.sendToDiskResult({
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
          let diskFiles: DiskCatalogFile[] =
            v.diskCreateFileOutput.files.filter(
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

          return Result.succeed({
            diskFiles: diskFiles,
            selectedSpaceFilePath: selectedSpaceFilePath
          });
        }
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
          > = await this.blockmlService.rebuildStructResult({
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
        'apiReport',
        async (v): Result.ResultAsync<Report, BackendCreateReportFailError> => {
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
        }
      ),
      Result.bind(
        'saveReportPayload',
        async (v): Result.ResultAsync<SaveReportPayload, DbErrorToError> => {
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

                      await this.db.packer.write({
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
        }
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'apiFinalReport',
        (v): Result.ResultAsync<ReportX, GetReportDataError> =>
          this.reportDataService.getReportDataResult({
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
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsError> =>
          this.modelsService.getModelPartXsResult({
            structId: v.currentStruct.structId,
            apiUserMember: v.apiUserMember
          })
      ),
      Result.bind(
        'reportsCatalog',
        (v): Result.ResultAsync<ReportsCatalog, GetReportsCatalogError> =>
          this.reportsService.getReportsCatalogResult({
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
