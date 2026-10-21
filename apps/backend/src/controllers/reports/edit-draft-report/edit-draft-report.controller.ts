import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendEditDraftReportRequestDto,
  ToBackendEditDraftReportResponseDto
} from '#backend/controllers/reports/edit-draft-report/edit-draft-report.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { ModelTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ReportDataService } from '#backend/services/report-data/report-data.service';
import { ReportRowService } from '#backend/services/report-row/report-row.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetModelCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditDraftReportOutput } from '#common/types/backend/routes/reports/edit-draft-report/edit-draft-report-output';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Row } from '#common/types/blockml/parts/report/row/row';

type PrepareReportChangesPayload = {
  processedRows: Row[];
  enabledChartRowIds: string[];
  apiUserMember: Member;
};

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditDraftReportController {
  constructor(
    private modelsService: ModelsService,
    private membersService: MembersService,
    private reportsService: ReportsService,
    private sessionsService: SessionsService,
    private reportDataService: ReportDataService,
    private reportRowService: ReportRowService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendEditDraftReport' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditDraftReport',
    description: 'Edit a draft report'
  })
  @ApiOkResponse({
    type: ToBackendEditDraftReportResponseDto
  })
  async editDraftRep(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditDraftReportRequestDto
  ): Promise<BackendResultForOperation<'editDraftReport'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        reportId: body.input.reportId,
        changeType: body.input.changeType,
        rowChange: body.input.rowChange,
        rowIds: body.input.rowIds,
        timeSpec: body.input.timeSpec,
        timezone: body.input.timezone,
        timeRangeFractionBrick: body.input.timeRangeFractionBrick,
        newReportFields: body.input.newReportFields,
        listeners: body.input.listeners,
        chart: body.input.chart
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
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
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
        this.envsService.getEnvCheckExistsAndAccess({
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
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('report', v =>
        this.reportsService.getReportCheckExistsAndAccess({
          projectId: v.projectId,
          reportId: v.reportId,
          structId: v.bridge.structId,
          user: v.user,
          userMember: v.userMember
        })
      ),
      Result.andThrough(async v => {
        if (
          isDefined(v.rowChange?.metricId) &&
          v.report.rows.map(row => row.metricId).indexOf(v.rowChange.metricId) <
            0
        ) {
          let metric: ModelMetric = v.struct.metrics.find(
            x => x.metricId === v.rowChange.metricId
          );

          let modelAccessResult: Result.Result<
            ModelTab,
            GetModelCheckExistsAndAccessError
          > = await this.modelsService.getModelCheckExistsAndAccess({
            structId: v.bridge.structId,
            modelId: metric.modelId,
            userMember: v.userMember
          });

          if (Result.isFailure(modelAccessResult)) {
            return modelAccessResult;
          }
        }

        return Result.succeed();
      }),
      Result.bind('prepareReportChangesPayload', v => {
        if (isDefined(v.newReportFields)) {
          v.report.rows
            .filter(row => isDefined(row.parameters))
            .forEach(row => {
              row.parameters = row.parameters.filter(
                parameter =>
                  !parameter.listen ||
                  v.newReportFields.map(y => y.id).indexOf(parameter.listen) >
                    -1
              );
            });
        }

        let processedRows: Row[] = this.reportRowService.getProcessedRows({
          rows: v.report.rows,
          rowChange: v.rowChange,
          rowIds: v.rowIds,
          changeType: v.changeType,
          timezone: v.timezone,
          timeSpec: v.timeSpec,
          timeRangeFractionBrick: v.timeRangeFractionBrick,
          metrics: v.struct.metrics,
          struct: v.struct,
          newReportFields: v.newReportFields,
          listeners: v.listeners
        });

        v.report.fields = v.newReportFields;

        v.report.rows = processedRows;

        v.report.chart = v.chart;

        let enabledChartRowIds: string[] = processedRows
          .filter(row => row.showChart === true)
          .map(row => row.rowId);

        v.report.chart.series = v.report.chart.series
          .filter(s => enabledChartRowIds.indexOf(s.dataRowId) > -1)
          .sort((a, b) =>
            a.dataRowId > b.dataRowId ? 1 : b.dataRowId > a.dataRowId ? -1 : 0
          );

        let apiUserMember: Member = this.membersService.tabToApi({
          member: v.userMember
        });

        let prepareReportChangesPayload: PrepareReportChangesPayload = {
          processedRows: processedRows,
          enabledChartRowIds: enabledChartRowIds,
          apiUserMember: apiUserMember
        };

        return Result.succeed(prepareReportChangesPayload);
      }),
      Result.bind('repApi', v =>
        this.reportDataService.getReportData({
          report: v.report,
          traceId: v.traceId,
          project: v.project,
          apiUserMember: v.prepareReportChangesPayload.apiUserMember,
          userMember: v.userMember,
          user: v.user,
          envId: v.envId,
          struct: v.struct,
          metrics: v.struct.metrics,
          timezone: v.timezone,
          timeSpec: v.timeSpec,
          timeRangeFractionBrick: v.timeRangeFractionBrick,
          isSaveToDb: true
        })
      ),
      Result.bind('modelPartXs', v =>
        this.modelsService.getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: v.prepareReportChangesPayload.apiUserMember
        })
      ),
      Result.map(
        (v): ToBackendEditDraftReportOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.prepareReportChangesPayload.apiUserMember,
          report: v.repApi
        })
      )
    );
  }
}
