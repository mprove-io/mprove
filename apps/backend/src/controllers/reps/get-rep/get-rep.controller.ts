import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MetricEntity } from '~backend/models/store-entities/metric.entity';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DbService } from '~backend/services/db.service';
import { DocService } from '~backend/services/doc.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRepController {
  constructor(
    private membersService: MembersService,
    private docService: DocService,
    private projectsService: ProjectsService,
    private rabbitService: RabbitService,
    private repsRepository: repositories.RepsRepository,
    private modelsRepository: repositories.ModelsRepository,
    private metricsRepository: repositories.MetricsRepository,
    private queriesRepository: repositories.QueriesRepository,
    private branchesService: BranchesService,
    private dbService: DbService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRep)
  async getModels(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetRepRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      repId,
      draft,
      withData,
      timeRangeFraction,
      timeSpec,
      timezone
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

    let emptyRep: entities.RepEntity = {
      project_id: projectId,
      struct_id: undefined,
      rep_id: repId,
      creator_id: undefined,
      draft: common.BoolEnum.FALSE,
      file_path: undefined,
      title: repId,
      access_roles: [],
      access_users: [],
      rows: [],
      draft_created_ts: undefined,
      server_ts: undefined
    };

    let rep =
      repId === common.EMPTY
        ? emptyRep
        : draft === true
        ? await this.repsRepository.findOne({
            where: {
              rep_id: repId,
              project_id: projectId,
              draft: common.BoolEnum.TRUE,
              struct_id: bridge.struct_id
            }
          })
        : await this.repsRepository.findOne({
            where: {
              rep_id: repId,
              project_id: projectId,
              draft: common.BoolEnum.FALSE,
              struct_id: bridge.struct_id
            }
          });

    if (common.isUndefined(rep)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REP_NOT_FOUND
      });
    }

    if (
      repId !== common.EMPTY &&
      rep.draft === common.BoolEnum.TRUE &&
      rep.creator_id !== user.user_id
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_DRAFT_REP_CREATOR_MISMATCH
      });
    }

    if (rep.draft === common.BoolEnum.FALSE) {
      let isAccessGranted = helper.checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: rep
      });

      if (isAccessGranted === false) {
        throw new common.ServerError({
          message: common.ErEnum.BACKEND_FORBIDDEN_REP
        });
      }
    }

    let { columns, isTimeColumnsLimitExceeded, timeColumnsLimit } =
      await this.blockmlService.getTimeColumns({
        traceId: traceId,
        timeSpec: timeSpec,
        timeRangeFraction: timeRangeFraction,
        projectWeekStart: struct.week_start
      });

    let metricIds = rep.rows.map(x => x.metricId);

    let metrics = await this.metricsRepository.find({
      where: {
        metric_id: In(metricIds),
        struct_id: bridge.struct_id
      }
    });

    let modelIds = metrics
      .filter(m => common.isDefined(m.model_id))
      .map(x => x.model_id);

    let models = await this.modelsRepository.find({
      where: {
        model_id: In(modelIds),
        struct_id: bridge.struct_id
      }
    });

    let newQueries: common.Query[] = [];
    let newMconfigs: common.Mconfig[] = [];

    await forEachSeries(rep.rows, async x => {
      let newMconfigId = common.makeId();
      let newQueryId = common.makeId();

      let metric: MetricEntity = metrics.find(m => m.metric_id === x.metricId);
      let model = models.find(ml => ml.model_id === metric.model_id);

      let timeSpecWord =
        timeSpec === common.TimeSpecEnum.Years
          ? 'year'
          : timeSpec === common.TimeSpecEnum.Quarters
          ? 'quarter'
          : timeSpec === common.TimeSpecEnum.Months
          ? 'month'
          : timeSpec === common.TimeSpecEnum.Weeks
          ? 'week'
          : timeSpec === common.TimeSpecEnum.Days
          ? 'date'
          : timeSpec === common.TimeSpecEnum.Hours
          ? 'hour'
          : timeSpec === common.TimeSpecEnum.Minutes
          ? 'minute'
          : undefined;

      let timeFieldIdSpec = `${metric.timefield_id}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

      let timeFilter: common.Filter = {
        fieldId: timeFieldIdSpec,
        fractions: [timeRangeFraction]
      };

      let timeSorting: common.Sorting = {
        desc: false,
        fieldId: timeFieldIdSpec
      };

      let mconfig: common.Mconfig = {
        structId: bridge.struct_id,
        mconfigId: newMconfigId,
        queryId: newQueryId,
        modelId: model.model_id,
        modelLabel: model.label,
        select: [timeFieldIdSpec, metric.field_id],
        sortings: [timeSorting],
        sorts: timeFieldIdSpec,
        timezone: timezone,
        limit: timeColumnsLimit,
        filters: [timeFilter],
        chart: common.DEFAULT_CHART,
        temp: true,
        serverTs: 1
        // fields: [],
        // extendedFilters: [],
      };

      let toBlockmlProcessQueryRequest: apiToBlockml.ToBlockmlProcessQueryRequest =
        {
          info: {
            name: apiToBlockml.ToBlockmlRequestInfoNameEnum
              .ToBlockmlProcessQuery,
            traceId: traceId
          },
          payload: {
            orgId: project.org_id,
            projectId: project.project_id,
            weekStart: struct.week_start,
            udfsDict: struct.udfs_dict,
            mconfig: mconfig,
            modelContent: model.content,
            envId: envId
          }
        };

      let blockmlProcessQueryResponse =
        await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlProcessQueryResponse>(
          {
            routingKey: common.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
            message: toBlockmlProcessQueryRequest,
            checkIsOk: true
          }
        );

      let newMconfig = blockmlProcessQueryResponse.payload.mconfig;
      let newQuery = blockmlProcessQueryResponse.payload.query;

      x.mconfig = newMconfig;
      x.query = newQuery;

      newMconfigs.push(newMconfig);
      newQueries.push(newQuery);
    });

    let newQueriesIds = newQueries.map(q => q.queryId);
    let dbQueries = await this.queriesRepository.find({
      where: {
        query_id: In(newQueriesIds),
        project_id: projectId
      }
    });
    let dbQueriesIds = dbQueries.map(x => x.query_id);

    let newQs = newQueries.filter(x => dbQueriesIds.indexOf(x.queryId) < 0);

    let records = await this.dbService.writeRecords({
      modify: false,
      records: {
        mconfigs: newMconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
        queries: newQs.map(x => wrapper.wrapToEntityQuery(x))
      }
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let repApi = wrapper.wrapToApiRep({
      rep: rep,
      member: apiMember,
      columns: columns,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: columns.length,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded
    });

    if (withData === true) {
      repApi = await this.docService.getData({ rep: repApi });
    }

    let payload: apiToBackend.ToBackendGetRepResponsePayload = {
      needValidate: common.enumToBoolean(bridge.need_validate),
      struct: wrapper.wrapToApiStruct(struct),
      userMember: apiMember,
      rep: repApi
    };

    return payload;
  }
}
