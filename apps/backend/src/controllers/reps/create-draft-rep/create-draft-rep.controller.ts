import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { ReportsService } from '~backend/services/reps.service';
import { StructsService } from '~backend/services/structs.service';

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
    private dbService: DbService,
    private metricsRepository: repositories.MetricsRepository,
    private queriesRepository: repositories.QueriesRepository,
    private mconfigsRepository: repositories.MconfigsRepository,
    private kitsRepository: repositories.KitsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDraftRep)
  async createDraftRep(
    @AttachUser() user: schemaPostgres.UserEntity,
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
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.user_id,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let fromRep: schemaPostgres.RepEntity = await this.repsService.getRep({
      projectId: projectId,
      repId: fromRepId,
      structId: bridge.struct_id,
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

    let copyQueries: schemaPostgres.QueryEntity[] =
      await this.queriesRepository.find({
        where: {
          query_id: In(fromCopyQueryIds),
          project_id: projectId
        }
      });

    let copyMconfigs: schemaPostgres.MconfigEntity[] =
      await this.mconfigsRepository.find({
        where: {
          mconfig_id: In(fromCopyMconfigIds),
          struct_id: struct.struct_id
        }
      });

    let copyKits: schemaPostgres.KitEntity[] = await this.kitsRepository.find({
      where: {
        kit_id: In(fromCopyKitIds),
        struct_id: struct.struct_id,
        rep_id: fromRepId
      }
    });

    copyQueries.forEach(x => {
      x.query_id = copyQueriesMap.find(
        y => y.fromQueryId === x.query_id
      ).toQueryId;
    });

    copyMconfigs.forEach(x => {
      x.mconfig_id = copyMconfigsMap.find(
        y => y.fromMconfigId === x.mconfig_id
      ).toMconfigId;

      x.query_id = copyQueriesMap.find(
        y => y.fromQueryId === x.query_id
      ).toQueryId;

      x.temp = common.BoolEnum.TRUE;
    });

    copyKits.forEach(x => {
      x.kit_id = copyKitsMap.find(y => y.fromKitId === x.kit_id).toKitId;
      x.rep_id = repId;
    });

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        queries: copyQueries,
        mconfigs: copyMconfigs,
        kits: copyKits
      }
    });

    let metrics =
      [
        common.ChangeTypeEnum.AddMetric,
        common.ChangeTypeEnum.EditParameters,
        common.ChangeTypeEnum.ConvertToMetric
      ].indexOf(changeType) > -1
        ? await this.metricsRepository.find({
            where: {
              struct_id: bridge.struct_id,
              metric_id: rowChange.metricId
            }
          })
        : [];

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

    let rep: schemaPostgres.RepEntity = {
      project_id: projectId,
      struct_id: bridge.struct_id,
      rep_id: repId,
      draft: common.BoolEnum.TRUE,
      access_roles: [],
      access_users: [],
      creator_id: user.user_id,
      file_path: undefined,
      title: repId,
      rows: processedRows,
      draft_created_ts: helper.makeTs(),
      server_ts: undefined
    };

    let userMemberApi = wrapper.wrapToApiMember(userMember);

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
      needValidate: common.enumToBoolean(bridge.need_validate),
      struct: wrapper.wrapToApiStruct(struct),
      userMember: userMemberApi,
      rep: repApi
    };

    return payload;
  }
}
