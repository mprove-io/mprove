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
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { kitsTable } from '~backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { KitsService } from '~backend/services/db/kits.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { ReportsService } from '~backend/services/db/reports.service';
import { StructsService } from '~backend/services/db/structs.service';
import { ReportDataService } from '~backend/services/report-data.service';
import { ReportRowService } from '~backend/services/report-row.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeId } from '~common/functions/make-id';
import { Row } from '~common/interfaces/blockml/row';
import { Rq } from '~common/interfaces/blockml/rq';
import {
  ToBackendCreateDraftReportRequest,
  ToBackendCreateDraftReportResponsePayload
} from '~common/interfaces/to-backend/reports/to-backend-create-draft-report';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateDraftReportController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private reportsService: ReportsService,
    private reportDataService: ReportDataService,
    private reportRowService: ReportRowService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private kitsService: KitsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport)
  async createDraftRep(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateDraftReportRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      fromReportId,
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

    let fromReport = await this.reportsService.getReport({
      projectId: projectId,
      reportId: fromReportId,
      structId: bridge.structId,
      isCheckExist: true,
      isCheckAccess: true,
      user: user,
      userMember: userMember
    });

    if (isDefined(newReportFields)) {
      fromReport.rows
        .filter(row => isDefined(row.parameters))
        .forEach(row => {
          row.parameters = row.parameters.filter(
            parameter =>
              !parameter.listen ||
              newReportFields.map(y => y.id).indexOf(parameter.listen) > -1
          );
        });
    }

    let reportId = makeId();

    let copyMconfigsMap: { fromMconfigId: string; toMconfigId: string }[] = [];
    let copyQueriesMap: { fromQueryId: string; toQueryId: string }[] = [];
    let copyKitsMap: { fromKitId: string; toKitId: string }[] = [];

    fromReport.rows.forEach(row => {
      if (
        row.rowType === RowTypeEnum.Metric ||
        row.rowType === RowTypeEnum.Formula
      ) {
        let rq: Rq = row.rqs.find(
          y =>
            y.fractionBrick === timeRangeFractionBrick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        if (isDefined(rq)) {
          if (row.rowType === RowTypeEnum.Metric && isDefined(rq.mconfigId)) {
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

          if (row.rowType === RowTypeEnum.Formula && isDefined(rq.kitId)) {
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

    let fromCopyQueryIds = copyQueriesMap.map(x => x.fromQueryId);
    let fromCopyMconfigIds = copyMconfigsMap.map(x => x.fromMconfigId);
    let fromCopyKitIds = copyKitsMap.map(x => x.fromKitId);

    let copyQueries = await this.db.drizzle.query.queriesTable
      .findMany({
        where: and(
          inArray(queriesTable.queryId, fromCopyQueryIds),
          eq(queriesTable.projectId, projectId)
        )
      })
      .then(xs => xs.map(x => this.queriesService.entToTab(x)));

    let copyMconfigs = await this.db.drizzle.query.mconfigsTable
      .findMany({
        where: and(
          inArray(mconfigsTable.mconfigId, fromCopyMconfigIds),
          eq(mconfigsTable.structId, struct.structId)
        )
      })
      .then(xs => xs.map(x => this.mconfigsService.entToTab(x)));

    let copyKits = await this.db.drizzle.query.kitsTable
      .findMany({
        where: and(
          inArray(kitsTable.kitId, fromCopyKitIds),
          eq(kitsTable.structId, struct.structId),
          eq(kitsTable.reportId, fromReportId)
        )
      })
      .then(xs => xs.map(x => this.kitsService.entToTab(x)));

    copyQueries.forEach(x => {
      x.queryId = copyQueriesMap.find(
        y => y.fromQueryId === x.queryId
      ).toQueryId;
    });

    copyMconfigs.forEach(x => {
      x.mconfigId = copyMconfigsMap.find(
        y => y.fromMconfigId === x.mconfigId
      ).toMconfigId;

      x.queryId = copyQueriesMap.find(
        y => y.fromQueryId === x.queryId
      ).toQueryId;
    });

    copyKits.forEach(x => {
      x.kitId = copyKitsMap.find(y => y.fromKitId === x.kitId).toKitId;
      x.reportId = reportId;
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                mconfigs: copyMconfigs,
                kits: copyKits
              },
              insertOrDoNothing: {
                queries: copyQueries
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let processedRows: Row[] = this.reportRowService.getProcessedRows({
      rows: fromReport.rows,
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

    let enabledChartRowIds = processedRows
      .filter(row => row.showChart === true)
      .map(row => row.rowId);

    chart.series = chart.series
      .filter(s => enabledChartRowIds.indexOf(s.dataRowId) > -1)
      .sort((a, b) =>
        a.dataRowId > b.dataRowId ? 1 : b.dataRowId > a.dataRowId ? -1 : 0
      );

    let report = this.reportsService.makeReport({
      projectId: projectId,
      structId: bridge.structId,
      reportId: reportId,
      draft: true,
      accessRoles: [],
      creatorId: user.userId,
      filePath: undefined,
      title: reportId,
      rows: processedRows,
      chart: chart,
      draftCreatedTs: makeTsNumber(),
      fields: newReportFields
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let apiReport = await this.reportDataService.getReportData({
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

    let payload: ToBackendCreateDraftReportResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      userMember: apiUserMember,
      report: apiReport
    };

    return payload;
  }
}
