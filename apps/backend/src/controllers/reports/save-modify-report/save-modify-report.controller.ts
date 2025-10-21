import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeReportFileText } from '~backend/functions/make-report-file-text';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { ReportsService } from '~backend/services/db/reports.service';
import { StructsService } from '~backend/services/db/structs.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReportDataService } from '~backend/services/report-data.service';
import { TabService } from '~backend/services/tab.service';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  RESTRICTED_USER_ALIAS,
  UTC
} from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import {
  ToBackendSaveModifyReportRequest,
  ToBackendSaveModifyReportResponsePayload
} from '~common/interfaces/to-backend/reports/to-backend-save-modify-report';
import {
  ToDiskSaveFileRequest,
  ToDiskSaveFileResponse
} from '~common/interfaces/to-disk/07-files/to-disk-save-file';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SaveModifyReportController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private structsService: StructsService,
    private reportsService: ReportsService,
    private reportDataService: ReportDataService,
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport)
  async saveModifyRep(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSaveModifyReportRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      modReportId,
      fromReportId,
      accessRoles,
      title,
      timeSpec,
      timeRangeFractionBrick,
      timezone,
      newReportFields,
      chart
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let fromReport = await this.reportsService.getReportCheckExistsAndAccess({
      projectId: projectId,
      reportId: fromReportId,
      structId: bridge.structId,
      user: user,
      userMember: userMember
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
      // skipMetrics: false
    });

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (
      userMember.isAdmin === false &&
      projectId === demoProjectId &&
      repoId === PROD_REPO_ID
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let existingModReport = await this.reportsService.getReportCheckExists({
      structId: bridge.structId,
      reportId: modReportId
    });

    if (userMember.isAdmin === false && userMember.isEditor === false) {
      this.reportsService.checkReportPath({
        userAlias: user.alias,
        filePath: existingModReport.filePath
      });
    }

    let metricIds = [
      ...new Set(
        fromReport.rows.map(row => row.metricId).filter(x => isDefined(x))
      )
    ];

    let cachedMetrics: ModelMetric[] = currentStruct.metrics.filter(
      metric => metricIds.indexOf(metric.metricId) > -1
    );

    let modelIds = [
      ...new Set(cachedMetrics.map(x => x.modelId).filter(x => isDefined(x)))
    ];

    let cachedModels =
      modelIds.length === 0
        ? []
        : await this.db.drizzle.query.modelsTable
            .findMany({
              where: and(
                eq(modelsTable.structId, bridge.structId),
                inArray(modelsTable.modelId, modelIds)
              )
            })
            .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let repFileText = makeReportFileText({
      reportId: modReportId,
      title: title,
      rows: fromReport.rows,
      accessRoles: accessRoles,
      metrics: currentStruct.metrics,
      models: cachedModels,
      struct: currentStruct,
      newReportFields: newReportFields,
      chart: chart,
      caseSensitiveStringFilters:
        currentStruct.mproveConfig.caseSensitiveStringFilters,
      timezone: UTC
    });

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskSaveFileRequest: ToDiskSaveFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingModReport.filePath,
        userAlias: user.alias,
        content: repFileText
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskSaveFileResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskSaveFileRequest,
        checkIsOk: true
      });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      if (x.envId !== envId) {
        x.structId = EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    let diskFiles = [
      diskResponse.payload.files.find(
        file => file.fileNodeId === existingModReport.filePath
      )
    ];

    let { reports: apiReports, struct: apiStruct } =
      await this.blockmlService.rebuildStruct({
        traceId: traceId,
        projectId: projectId,
        structId: bridge.structId,
        diskFiles: diskFiles,
        mproveDir: currentStruct.mproveConfig.mproveDirValue,
        skipDb: true,
        envId: envId,
        overrideTimezone: undefined,
        isUseCache: true,
        cachedMproveConfig: currentStruct.mproveConfig,
        cachedModels: cachedModels,
        cachedMetrics: cachedMetrics
      });

    currentStruct.errors = [...currentStruct.errors, ...apiStruct.errors];

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              structs: [currentStruct],
              bridges: [...branchBridges]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let apiReport = apiReports.find(x => x.reportId === modReportId);

    if (isUndefined(apiReport)) {
      await retry(
        async () =>
          await this.db.drizzle.transaction(async tx => {
            await tx
              .delete(reportsTable)
              .where(
                and(
                  eq(reportsTable.reportId, modReportId),
                  eq(reportsTable.structId, bridge.structId)
                )
              );
          }),
        getRetryOption(this.cs, this.logger)
      );

      let fileIdAr = existingModReport.filePath.split('/');
      fileIdAr.shift();
      let filePath = fileIdAr.join('/');

      throw new ServerError({
        message: ErEnum.BACKEND_MODIFY_REPORT_FAIL,
        displayData: {
          encodedFileId: encodeFilePath({ filePath: filePath }),
          structErrors: apiStruct.errors
        }
      });
    }

    apiReport.rows = fromReport.rows;

    let report = this.reportsService.apiToTab({ apiReport: apiReport });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(reportsTable)
            .where(
              and(
                eq(reportsTable.draft, true),
                eq(reportsTable.projectId, projectId),
                eq(reportsTable.reportId, fromReportId),
                eq(reportsTable.creatorId, user.userId)
              )
            );

          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              reports: [report]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let apiFinalReport = await this.reportDataService.getReportData({
      report: report,
      traceId: traceId,
      project: project,
      apiUserMember: apiUserMember,
      userMember: userMember,
      user: user,
      envId: envId,
      struct: apiStruct,
      metrics: apiStruct.metrics,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      timezone: timezone
    });

    let payload: ToBackendSaveModifyReportResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: currentStruct }),
      userMember: apiUserMember,
      report: apiFinalReport,
      reportPart: apiFinalReport
    };

    return payload;
  }
}
