import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeReportFileText } from '~backend/functions/make-report-file-text';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReportDataService } from '~backend/services/report-data.service';
import { ReportsService } from '~backend/services/reports.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SaveModifyReportController {
  constructor(
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
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport)
  async saveModifyRep(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendSaveModifyReportRequest = request.body;

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

    let fromReport = await this.reportsService.getReport({
      projectId: projectId,
      reportId: fromReportId,
      structId: bridge.structId,
      checkExist: true,
      checkAccess: true,
      user: user,
      userMember: userMember
    });

    let metricRows = fromReport.rows.filter(
      row => row.rowType === RowTypeEnum.Metric
    );

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId,
      addMetrics: true
      // addMetrics: metricRows.length > 0
    });

    let firstProjectId =
      this.cs.get<BackendConfig['firstProjectId']>('firstProjectId');

    if (
      userMember.isAdmin === false &&
      projectId === firstProjectId &&
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
      this.reportsService.checkRepPath({
        userAlias: user.alias,
        filePath: existingModReport.filePath
      });
    }

    let models: ModelEnt[] = [];

    if (currentStruct.metrics.length > 0) {
      let metricModelIds = currentStruct.metrics.map(x => x.modelId);

      models = await this.db.drizzle.query.modelsTable.findMany({
        where: and(
          inArray(modelsTable.modelId, metricModelIds),
          eq(modelsTable.structId, bridge.structId)
        )
      });
    }

    let repFileText = makeReportFileText({
      reportId: modReportId,
      title: title,
      rows: fromReport.rows,
      accessRoles: accessRoles,
      metrics: currentStruct.metrics,
      models: models,
      struct: currentStruct,
      newReportFields: newReportFields,
      chart: chart,
      caseSensitiveStringFilters: currentStruct.caseSensitiveStringFilters,
      timezone: UTC
    });

    let toDiskSaveFileRequest: apiToDisk.ToDiskSaveFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingModReport.filePath,
        userAlias: user.alias,
        content: repFileText,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskSaveFileResponse>({
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

    let { reports, struct } = await this.blockmlService.rebuildStruct({
      traceId: traceId,
      projectId: projectId,
      structId: bridge.structId,
      diskFiles: diskResponse.payload.files,
      mproveDir: diskResponse.payload.mproveDir,
      skipDb: true,
      envId: envId,
      overrideTimezone: undefined
    });

    let report = reports.find(x => x.reportId === modReportId);

    if (isDefined(report)) {
      report.rows = fromReport.rows;
    }

    let repEnt = isDefined(report)
      ? this.wrapToEntService.wrapToEntityReport(report)
      : undefined;

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          if (isUndefined(report)) {
            await tx
              .delete(reportsTable)
              .where(
                and(
                  eq(reportsTable.reportId, modReportId),
                  eq(reportsTable.structId, bridge.structId)
                )
              );
          }

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
              reports: isDefined(repEnt) ? [repEnt] : [],
              structs: [struct],
              bridges: [...branchBridges]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    if (isUndefined(report)) {
      let fileIdAr = existingModReport.filePath.split('/');
      fileIdAr.shift();
      let filePath = fileIdAr.join('/');

      throw new ServerError({
        message: ErEnum.BACKEND_MODIFY_REPORT_FAIL,
        data: {
          encodedFileId: encodeFilePath({ filePath: filePath })
        }
      });
    }

    let userMemberApi = this.wrapToApiService.wrapToApiMember(userMember);

    let repApi = await this.reportDataService.getReportData({
      report: repEnt,
      traceId: traceId,
      project: project,
      userMemberApi: userMemberApi,
      userMember: userMember,
      user: user,
      envId: envId,
      struct: struct,
      metrics: struct.metrics,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      timezone: timezone
    });

    let payload: apiToBackend.ToBackendSaveModifyReportResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: userMemberApi,
      report: repApi,
      reportPart: repApi
    };

    return payload;
  }
}
