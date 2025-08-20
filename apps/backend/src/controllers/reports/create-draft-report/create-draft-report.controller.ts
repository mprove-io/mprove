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
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { kitsTable } from '~backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { ReportDataService } from '~backend/services/report-data.service';
import { ReportRowService } from '~backend/services/report-row.service';
import { ReportsService } from '~backend/services/reports.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
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

@UseGuards(ValidateRequestGuard)
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
    private makerService: MakerService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport)
  async createDraftRep(@AttachUser() user: UserEnt, @Req() request: any) {
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
      projectId: projectId,
      addMetrics: true
      // addMetrics:
      //   isDefined(rowChange) &&
      //   [
      //     ChangeTypeEnum.AddMetric,
      //     ChangeTypeEnum.ConvertToMetric
      //   ].indexOf(changeType) > -1
    });

    let fromReport: ReportEnt = await this.reportsService.getReport({
      projectId: projectId,
      reportId: fromReportId,
      structId: bridge.structId,
      checkExist: true,
      checkAccess: true,
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

    let copyQueries = await this.db.drizzle.query.queriesTable.findMany({
      where: and(
        inArray(queriesTable.queryId, fromCopyQueryIds),
        eq(queriesTable.projectId, projectId)
      )
    });

    let copyMconfigs = await this.db.drizzle.query.mconfigsTable.findMany({
      where: and(
        inArray(mconfigsTable.mconfigId, fromCopyMconfigIds),
        eq(mconfigsTable.structId, struct.structId)
      )
    });

    let copyKits = await this.db.drizzle.query.kitsTable.findMany({
      where: and(
        inArray(kitsTable.kitId, fromCopyKitIds),
        eq(kitsTable.structId, struct.structId),
        eq(kitsTable.reportId, fromReportId)
      )
    });

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

      x.temp = true;
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

    let models: ModelEnt[] = [];

    // if (
    //   changeType === ChangeTypeEnum.ConvertToMetric &&
    //   isDefined(rowChange?.metricId)
    // ) {
    //   let metric = struct.metrics.find(x => x.metricId === rowChange.metricId);

    //   let model = await this.db.drizzle.query.modelsTable.findFirst({
    //     where: and(
    //       eq(modelsTable.structId, struct.structId),
    //       eq(modelsTable.modelId, metric.modelId)
    //     )
    //   });

    //   models.push(model);
    // }

    let processedRows: Row[] = this.reportRowService.getProcessedRows({
      rows: fromReport.rows,
      rowChange: rowChange,
      rowIds: rowIds,
      changeType: changeType,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      metrics: struct.metrics,
      models: models,
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

    let report: ReportEnt = this.makerService.makeReport({
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

    let userMemberApi = this.wrapToApiService.wrapToApiMember(userMember);

    let apiReport = await this.reportDataService.getReportData({
      report: report,
      traceId: traceId,
      project: project,
      userMemberApi: userMemberApi,
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
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: userMemberApi,
      report: apiReport
    };

    return payload;
  }
}
