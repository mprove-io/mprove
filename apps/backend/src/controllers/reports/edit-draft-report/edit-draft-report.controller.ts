import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { ReportsService } from '~backend/services/db/reports.service';
import { StructsService } from '~backend/services/db/structs.service';
import { ReportDataService } from '~backend/services/report-data.service';
import { ReportRowService } from '~backend/services/report-row.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendEditDraftReportRequest,
  ToBackendEditDraftReportResponsePayload
} from '~common/interfaces/to-backend/reports/to-backend-edit-draft-report';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditDraftReportController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private reportsService: ReportsService,
    private reportDataService: ReportDataService,
    private reportRowService: ReportRowService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditDraftReport)
  async editDraftRep(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendEditDraftReportRequest = request.body;

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
      listeners,
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
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
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
      // skipMetrics: false
    });

    let report = await this.reportsService.getReportCheckExistsAndAccess({
      projectId: projectId,
      reportId: reportId,
      structId: bridge.structId,
      user: user,
      userMember: userMember
    });

    if (isDefined(newReportFields)) {
      report.rows
        .filter(row => isDefined(row.parameters))
        .forEach(row => {
          row.parameters = row.parameters.filter(
            parameter =>
              !parameter.listen ||
              newReportFields.map(y => y.id).indexOf(parameter.listen) > -1
          );
        });
    }

    let processedRows = this.reportRowService.getProcessedRows({
      rows: report.rows,
      rowChange: rowChange,
      rowIds: rowIds,
      changeType: changeType,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      metrics: struct.metrics,
      struct: struct,
      newReportFields: newReportFields,
      listeners: listeners
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

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let repApi = await this.reportDataService.getReportData({
      report: report,
      traceId: traceId,
      project: project,
      apiUserMember: apiUserMember,
      userMember: userMember,
      user: user,
      envId: envId,
      struct: struct,
      metrics: struct.metrics,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      isSaveToDb: true
    });

    let payload: ToBackendEditDraftReportResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      userMember: apiUserMember,
      report: repApi
    };

    return payload;
  }
}
