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
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { kitsTable } from '~backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { metricsTable } from '~backend/drizzle/postgres/schema/metrics';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { ReportsService } from '~backend/services/reports.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateDraftRepController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private repsService: ReportsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private makerService: MakerService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDraftRep)
  async createDraftRep(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateDraftRepRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      fromRepId,
      changeType,
      rowChange,
      rowIds,
      timeSpec,
      timezone,
      timeRangeFractionBrick
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

    let fromRep: schemaPostgres.ReportEnt = await this.repsService.getRep({
      projectId: projectId,
      repId: fromRepId,
      structId: bridge.structId,
      checkExist: true,
      checkAccess: true,
      user: user,
      userMember: userMember
    });

    let repId = common.makeId();

    let copyMconfigsMap: { fromMconfigId: string; toMconfigId: string }[] = [];
    let copyQueriesMap: { fromQueryId: string; toQueryId: string }[] = [];
    let copyKitsMap: { fromKitId: string; toKitId: string }[] = [];

    fromRep.rows.forEach(row => {
      if (
        row.rowType === common.RowTypeEnum.Metric ||
        row.rowType === common.RowTypeEnum.Formula
      ) {
        let rq: common.Rq = row.rqs.find(
          y =>
            y.fractionBrick === timeRangeFractionBrick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        if (common.isDefined(rq)) {
          if (
            row.rowType === common.RowTypeEnum.Metric &&
            common.isDefined(rq.mconfigId)
          ) {
            let newMconfigId = common.makeId();
            let newQueryId = common.makeId();

            copyMconfigsMap.push({
              fromMconfigId: rq.mconfigId,
              toMconfigId: newMconfigId
            });

            rq.mconfigId = newMconfigId;

            if (common.isDefined(rq.queryId)) {
              copyQueriesMap.push({
                fromQueryId: rq.queryId,
                toQueryId: newQueryId
              });

              rq.queryId = newQueryId;
            }
          }

          if (
            row.rowType === common.RowTypeEnum.Formula &&
            common.isDefined(rq.kitId)
          ) {
            let newKitId = common.makeId();

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

    // let copyQueries: schemaPostgres.QueryEntity[] =
    //   await this.queriesRepository.find({
    //     where: {
    //       query_id: In(fromCopyQueryIds),
    //       project_id: projectId
    //     }
    //   });

    let copyMconfigs = await this.db.drizzle.query.mconfigsTable.findMany({
      where: and(
        inArray(mconfigsTable.mconfigId, fromCopyMconfigIds),
        eq(mconfigsTable.structId, struct.structId)
      )
    });

    // let copyMconfigs: schemaPostgres.MconfigEntity[] =
    //   await this.mconfigsRepository.find({
    //     where: {
    //       mconfig_id: In(fromCopyMconfigIds),
    //       struct_id: struct.struct_id
    //     }
    //   });

    let copyKits = await this.db.drizzle.query.kitsTable.findMany({
      where: and(
        inArray(kitsTable.kitId, fromCopyKitIds),
        eq(kitsTable.structId, struct.structId),
        eq(kitsTable.reportId, fromRepId)
      )
    });

    // let copyKits: schemaPostgres.KitEntity[] = await this.kitsRepository.find({
    //   where: {
    //     kit_id: In(fromCopyKitIds),
    //     struct_id: struct.struct_id,
    //     rep_id: fromRepId
    //   }
    // });

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
      x.reportId = repId;
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
              insertOrUpdate: {
                queries: copyQueries
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    // let records = await this.dbService.writeRecords({
    //   modify: false,
    //   records: {
    //     queries: copyQueries,
    //     mconfigs: copyMconfigs,
    //     kits: copyKits
    //   }
    // });

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

    let processedRows: common.Row[] = this.repsService.getProcessedRows({
      rows: fromRep.rows,
      rowChange: rowChange,
      rowIds: rowIds,
      changeType: changeType,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      metrics: metrics,
      struct: struct
    });

    let rep: schemaPostgres.ReportEnt = this.makerService.makeReport({
      projectId: projectId,
      structId: bridge.structId,
      reportId: repId,
      draft: true,
      accessRoles: [],
      accessUsers: [],
      creatorId: user.userId,
      filePath: undefined,
      title: repId,
      rows: processedRows,
      draftCreatedTs: makeTsNumber()
    });

    let userMemberApi = this.wrapToApiService.wrapToApiMember(userMember);

    let repApi = await this.repsService.getRepData({
      rep: rep,
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

    let payload: apiToBackend.ToBackendCreateDraftRepResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: userMemberApi,
      rep: repApi
    };

    return payload;
  }
}
