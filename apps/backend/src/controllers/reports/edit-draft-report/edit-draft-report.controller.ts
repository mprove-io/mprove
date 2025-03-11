import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { metricsTable } from '~backend/drizzle/postgres/schema/metrics';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { ReportsService } from '~backend/services/reports.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class EditDraftReportController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private reportsService: ReportsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditDraftReport)
  async editDraftRep(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendEditDraftReportRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      reportId,
      changeType,
      rowChange,
      rowIds,
      timeSpec,
      timezone,
      timeRangeFractionBrick,
      newReportFields,
      chart
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.userId,
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

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let report = await this.reportsService.getReport({
      projectId: projectId,
      reportId: reportId,
      structId: bridge.structId,
      checkExist: true,
      checkAccess: true,
      user: user,
      userMember: userMember
    });

    let metrics =
      [
        common.ChangeTypeEnum.AddMetric,
        common.ChangeTypeEnum.EditParameters,
        common.ChangeTypeEnum.ConvertToMetric
      ].indexOf(changeType) > -1
        ? await this.db.drizzle.query.metricsTable.findMany({
            where: and(
              eq(metricsTable.structId, bridge.structId),
              eq(metricsTable.metricId, rowChange.metricId)
            )
          })
        : // await this.metricsRepository.find({
          //     where: {
          //       struct_id: bridge.struct_id,
          //       metric_id: rowChange.metricId
          //     }
          //   })
          [];

    let models: ModelEnt[] = [];

    if (
      common.isDefined(rowChange.metricId) &&
      changeType === common.ChangeTypeEnum.ConvertToMetric
    ) {
      let metric = metrics.find(x => x.metricId === rowChange.metricId);

      let model = await this.db.drizzle.query.modelsTable.findFirst({
        where: and(
          eq(modelsTable.structId, struct.structId),
          eq(modelsTable.modelId, metric.modelId)
        )
      });

      models.push(model);
    }

    let processedRows = this.reportsService.getProcessedRows({
      rows: report.rows,
      rowChange: rowChange,
      rowIds: rowIds,
      changeType: changeType,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      metrics: metrics,
      models: models,
      struct: struct
    });

    report.fields = newReportFields;
    report.rows = processedRows;
    report.chart = chart;

    let enabledChartRowIds = processedRows
      .filter(row => row.showChart === true)
      .map(row => row.rowId);

    report.chart.series = report.chart.series
      .filter(s => enabledChartRowIds.indexOf(s.dataRowId) > -1)
      .sort((a, b) =>
        a.dataRowId > b.dataRowId ? 1 : b.dataRowId > a.dataRowId ? -1 : 0
      );

    let userMemberApi = this.wrapToApiService.wrapToApiMember(userMember);

    let repApi = await this.reportsService.getRepData({
      report: report,
      traceId: traceId,
      project: project,
      userMemberApi: userMemberApi,
      userMember: userMember,
      user: user,
      envId: envId,
      struct: struct,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      isSaveToDb: true
    });

    let payload: apiToBackend.ToBackendEditDraftReportResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: userMemberApi,
      report: repApi
    };

    return payload;
  }
}
