import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
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
import { RepsService } from '~backend/services/reps.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRepController {
  constructor(
    private membersService: MembersService,
    private docService: DocService,
    private projectsService: ProjectsService,
    private rabbitService: RabbitService,
    private repsService: RepsService,
    private modelsRepository: repositories.ModelsRepository,
    private metricsRepository: repositories.MetricsRepository,
    private queriesRepository: repositories.QueriesRepository,
    private mconfigsRepository: repositories.MconfigsRepository,
    private branchesService: BranchesService,
    private dbService: DbService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRep)
  async getRep(@AttachUser() user: entities.UserEntity, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetRepRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      repId,
      draft,
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

    let rep = await this.repsService.getRep({
      projectId: projectId,
      repId: repId,
      draft: draft,
      structId: bridge.struct_id,
      checkExist: true,
      checkAccess: true,
      user: user,
      userMember: userMember
    });

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

    let queryIds: string[] = [];
    let mconfigIds: string[] = [];

    await forEachSeries(rep.rows, async x => {
      let rq = x.rqs.find(y => y.fractionBrick === timeRangeFraction.brick);

      if (common.isDefined(rq)) {
        queryIds.push(rq.queryId);
        mconfigIds.push(rq.mconfigId);
      } else {
        let newMconfigId = common.makeId();
        let newQueryId = common.makeId();

        let metric: MetricEntity = metrics.find(
          m => m.metric_id === x.metricId
        );
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
              routingKey:
                common.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
              message: toBlockmlProcessQueryRequest,
              checkIsOk: true
            }
          );

        let newMconfig = blockmlProcessQueryResponse.payload.mconfig;
        let newQuery = blockmlProcessQueryResponse.payload.query;

        newMconfig.queryId = newQueryId;
        newQuery.queryId = newQueryId;

        let newRq: common.Rq = {
          fractionBrick: timeRangeFraction.brick,
          mconfigId: newMconfig.mconfigId,
          queryId: newMconfig.queryId,
          records: [],
          lastCompleteTsCalculated: 0
        };

        x.rqs.push(newRq);

        newMconfigs.push(newMconfig);
        newQueries.push(newQuery);
      }
    });

    let queries: entities.QueryEntity[] = [];
    if (queryIds.length > 0) {
      queries = await this.queriesRepository.find({
        where: {
          query_id: In(queryIds),
          project_id: projectId
        }
      });
    }

    let mconfigs: entities.MconfigEntity[] = [];
    if (mconfigIds.length > 0) {
      mconfigs = await this.mconfigsRepository.find({
        where: {
          mconfig_id: In(mconfigIds),
          struct_id: bridge.struct_id
        }
      });
    }

    let queriesApi = queries.map(x => wrapper.wrapToApiQuery(x));
    let mconfigsApi = mconfigs.map(x =>
      wrapper.wrapToApiMconfig({
        mconfig: x,
        modelFields: models.find(m => m.model_id === x.model_id).fields
      })
    );

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

    repApi.rows.forEach(x => {
      let rq = x.rqs.find(y => y.fractionBrick === timeRangeFraction.brick);

      x.mconfig = [...mconfigsApi, ...newMconfigs].find(
        y => y.mconfigId === rq.mconfigId
      );

      x.query = [...queriesApi, ...newQueries].find(
        y => y.queryId === rq.queryId
      );
    });

    let completedRowsLength = repApi.rows
      .map(row => row.query.status)
      .filter(s => s === common.QueryStatusEnum.Completed).length;

    let calculatedRowsLength = repApi.rows.filter(row => {
      let rq = row.rqs.find(y => y.fractionBrick === timeRangeFraction.brick);

      return rq.lastCompleteTsCalculated === row.query.lastCompleteTs;
    }).length;

    let isCalculate =
      rep.rep_id !== common.EMPTY &&
      repApi.rows.length === completedRowsLength &&
      repApi.rows.length !== calculatedRowsLength;

    if (isCalculate === true) {
      // console.log('req data');
      repApi = await this.docService.getData({
        rep: repApi,
        timeSpec: timeSpec,
        timeRangeFraction: timeRangeFraction
      });
    } else {
      // console.log('no req data');
      repApi.rows.forEach(x => {
        let rq = x.rqs.find(y => y.fractionBrick === timeRangeFraction.brick);
        x.records = rq.records;
      });
    }

    if (newMconfigs.length > 0 || newQueries.length > 0) {
      await this.dbService.writeRecords({
        modify: false,
        records: {
          mconfigs: newMconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
          queries: newQueries.map(x => wrapper.wrapToEntityQuery(x))
        }
      });
    }

    if (
      isCalculate === true ||
      newMconfigs.length > 0 ||
      newQueries.length > 0
    ) {
      let dbRows = common.makeCopy(rep.rows);

      dbRows.forEach(x => {
        delete x.mconfig;
        delete x.query;
      });

      rep.rows = dbRows;

      await this.dbService.writeRecords({
        modify: true,
        records: {
          reps: [rep]
        }
      });
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
