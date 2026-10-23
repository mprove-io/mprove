import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendCreateDraftReportRequestDto,
  ToBackendCreateDraftReportResponseDto
} from '#backend/controllers/reports/create-draft-report/create-draft-report.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ModelTab,
  ReportTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { kitsTable } from '#backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
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
import { makeId } from '#common/functions/make-id/make-id';
import type { GetModelCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-model-check-exists-and-access-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateDraftReportOutput } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-output';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { Rq } from '#common/types/blockml/parts/report/row/rq';

type PrepareReportCopiesPayload = {
  reportId: string;
  copyMconfigsMap: MconfigCopies;
  copyQueriesMap: QueryCopies;
  copyKitsMap: KitCopies;
  fromCopyQueryIds: string[];
  fromCopyMconfigIds: string[];
  fromCopyKitIds: string[];
};

type PrepareDraftReportPayload = {
  processedRows: Row[];
  enabledChartRowIds: string[];
  report: ReportTab;
  apiUserMember: Member;
};

type MconfigCopies = {
  fromMconfigId: string;
  toMconfigId: string;
}[];

type QueryCopies = {
  fromQueryId: string;
  toQueryId: string;
}[];

type KitCopies = {
  fromKitId: string;
  toKitId: string;
}[];

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateDraftReportController {
  constructor(
    private modelsService: ModelsService,
    private membersService: MembersService,
    private reportsService: ReportsService,
    private sessionsService: SessionsService,
    private reportDataService: ReportDataService,
    private reportRowService: ReportRowService,
    private structsService: StructsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendCreateDraftReport' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateDraftReport',
    description: 'Create a draft report from an existing report'
  })
  @ApiOkResponse({
    type: ToBackendCreateDraftReportResponseDto
  })
  async createDraftRep(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateDraftReportRequestDto
  ): Promise<BackendResultForOperation<'createDraftReport'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        fromReportId: body.input.fromReportId,
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
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
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
      Result.andThrough(async v => {
        if (
          isDefined(v.rowChange?.metricId) &&
          v.fromReport.rows
            .map(row => row.metricId)
            .indexOf(v.rowChange.metricId) < 0
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
      Result.bind('prepareReportCopiesPayload', v => {
        if (isDefined(v.newReportFields)) {
          v.fromReport.rows
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

        let reportId: string = makeId();

        let copyMconfigsMap: MconfigCopies = [];

        let copyQueriesMap: QueryCopies = [];

        let copyKitsMap: KitCopies = [];

        v.fromReport.rows.forEach(row => {
          if (row.rowType === 'metric' || row.rowType === 'formula') {
            // Copy only the current RQ to the draft, not all RQs.
            let rq: Rq = row.rqs.find(
              y =>
                y.fractionBrick === v.timeRangeFractionBrick &&
                y.timeSpec === v.timeSpec &&
                y.timezone === v.timezone
            );

            if (isDefined(rq)) {
              if (row.rowType === 'metric' && isDefined(rq.mconfigId)) {
                let newMconfigId = makeId();

                let newQueryId = makeId();

                copyMconfigsMap.push({
                  fromMconfigId: rq.mconfigId,
                  toMconfigId: newMconfigId
                });

                rq.mconfigId = newMconfigId;

                if (isDefined(rq.queryId)) {
                  copyQueriesMap.push({
                    fromQueryId: rq.queryId,
                    toQueryId: newQueryId
                  });

                  rq.queryId = newQueryId;
                }
              }

              if (row.rowType === 'formula' && isDefined(rq.kitId)) {
                let newKitId = makeId();

                copyKitsMap.push({
                  fromKitId: rq.kitId,
                  toKitId: newKitId
                });

                rq.kitId = newKitId;
              }

              row.rqs = [rq];
            } else {
              row.rqs = [];
            }
          }
        });

        let fromCopyQueryIds: string[] = copyQueriesMap.map(x => x.fromQueryId);

        let fromCopyMconfigIds: string[] = copyMconfigsMap.map(
          x => x.fromMconfigId
        );

        let fromCopyKitIds: string[] = copyKitsMap.map(x => x.fromKitId);

        let prepareReportCopiesPayload: PrepareReportCopiesPayload = {
          reportId: reportId,
          copyMconfigsMap: copyMconfigsMap,
          copyQueriesMap: copyQueriesMap,
          copyKitsMap: copyKitsMap,
          fromCopyQueryIds: fromCopyQueryIds,
          fromCopyMconfigIds: fromCopyMconfigIds,
          fromCopyKitIds: fromCopyKitIds
        };

        return Result.succeed(prepareReportCopiesPayload);
      }),
      Result.bind('copyQueries', v =>
        this.db.queries.findMany({
          where: and(
            inArray(
              queriesTable.queryId,
              v.prepareReportCopiesPayload.fromCopyQueryIds
            ),
            eq(queriesTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('copyMconfigs', v =>
        this.db.mconfigs.findMany({
          where: and(
            inArray(
              mconfigsTable.mconfigId,
              v.prepareReportCopiesPayload.fromCopyMconfigIds
            ),
            eq(mconfigsTable.structId, v.struct.structId)
          )
        })
      ),
      Result.bind('copyKits', v =>
        this.db.kits.findMany({
          where: and(
            inArray(
              kitsTable.kitId,
              v.prepareReportCopiesPayload.fromCopyKitIds
            ),
            eq(kitsTable.structId, v.struct.structId),
            eq(kitsTable.reportId, v.fromReportId)
          )
        })
      ),
      Result.andThrough(v => {
        v.copyQueries.forEach(x => {
          x.queryId = v.prepareReportCopiesPayload.copyQueriesMap.find(
            y => y.fromQueryId === x.queryId
          ).toQueryId;

          x.reportId = v.prepareReportCopiesPayload.reportId;

          x.reportStructId = v.bridge.structId;
        });

        v.copyMconfigs.forEach(x => {
          x.mconfigId = v.prepareReportCopiesPayload.copyMconfigsMap.find(
            y => y.fromMconfigId === x.mconfigId
          ).toMconfigId;

          x.queryId = v.prepareReportCopiesPayload.copyQueriesMap.find(
            y => y.fromQueryId === x.queryId
          ).toQueryId;
        });

        v.copyKits.forEach(x => {
          x.kitId = v.prepareReportCopiesPayload.copyKitsMap.find(
            y => y.fromKitId === x.kitId
          ).toKitId;

          x.reportId = v.prepareReportCopiesPayload.reportId;
        });

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        let persistenceResult: Result.Result<void, WriteError> =
          await this.db.write({
            insert: {
              mconfigs: v.copyMconfigs,
              kits: v.copyKits
            },
            insertOrDoNothing: {
              queries: v.copyQueries
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed();
      }),
      Result.bind('prepareDraftReportPayload', v => {
        let processedRows: Row[] = this.reportRowService.getProcessedRows({
          rows: v.fromReport.rows,
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

        let enabledChartRowIds: string[] = processedRows
          .filter(row => row.showChart === true)
          .map(row => row.rowId);

        v.chart.series = v.chart.series
          .filter(s => enabledChartRowIds.indexOf(s.dataRowId) > -1)
          .sort((a, b) =>
            a.dataRowId > b.dataRowId ? 1 : b.dataRowId > a.dataRowId ? -1 : 0
          );

        let report: ReportTab = this.reportsService.makeReport({
          projectId: v.projectId,
          structId: v.bridge.structId,
          reportId: v.prepareReportCopiesPayload.reportId,
          draft: true,
          space: undefined,
          accessRoles: [],
          creatorId: v.user.userId,
          filePath: undefined,
          title: v.prepareReportCopiesPayload.reportId,
          rows: processedRows,
          chart: v.chart,
          draftCreatedTs: makeTsNumber(),
          fields: v.newReportFields
        });

        let apiUserMember: Member = this.membersService.tabToApi({
          member: v.userMember
        });

        let prepareDraftReportPayload: PrepareDraftReportPayload = {
          processedRows: processedRows,
          enabledChartRowIds: enabledChartRowIds,
          report: report,
          apiUserMember: apiUserMember
        };

        return Result.succeed(prepareDraftReportPayload);
      }),
      Result.bind('apiReport', v =>
        this.reportDataService.getReportData({
          report: v.prepareDraftReportPayload.report,
          traceId: v.traceId,
          project: v.project,
          apiUserMember: v.prepareDraftReportPayload.apiUserMember,
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
          apiUserMember: v.prepareDraftReportPayload.apiUserMember
        })
      ),
      Result.bind('reportsCatalog', v =>
        this.reportsService.getReportsCatalog({
          projectId: v.projectId,
          structId: v.bridge.structId,
          user: v.user,
          userMember: v.userMember,
          apiUserMember: v.prepareDraftReportPayload.apiUserMember,
          spaces: v.struct.spaces
        })
      ),
      Result.map(
        (v): ToBackendCreateDraftReportOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.prepareDraftReportPayload.apiUserMember,
          report: v.apiReport,
          reportUnitDrafts: v.reportsCatalog.reportUnitDrafts
        })
      )
    );
  }
}
