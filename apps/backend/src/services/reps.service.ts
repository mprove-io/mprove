import { Injectable } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { In } from 'typeorm';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { BlockmlService } from './blockml.service';
import { DbService } from './db.service';
import { DocService } from './doc.service';
import { RabbitService } from './rabbit.service';

@Injectable()
export class RepsService {
  constructor(
    private repsRepository: repositories.RepsRepository,
    private docService: DocService,
    private rabbitService: RabbitService,
    private modelsRepository: repositories.ModelsRepository,
    private metricsRepository: repositories.MetricsRepository,
    private queriesRepository: repositories.QueriesRepository,
    private mconfigsRepository: repositories.MconfigsRepository,
    private dbService: DbService,
    private blockmlService: BlockmlService
  ) {}

  async getRepCheckExists(item: { repId: string; structId: string }) {
    let { repId, structId } = item;

    let rep = await this.repsRepository.findOne({
      where: {
        struct_id: structId,
        rep_id: repId
      }
    });

    if (common.isUndefined(rep)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REP_DOES_NOT_EXIST
      });
    }

    return rep;
  }

  checkRepPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_REP_PATH
      });
    }
  }

  async getRep(item: {
    projectId: string;
    repId: string;
    draft: boolean;
    structId: string;
    user: entities.UserEntity;
    userMember: entities.MemberEntity;
    checkExist: boolean;
    checkAccess: boolean;
  }) {
    let {
      projectId,
      repId,
      draft,
      structId,
      checkExist,
      checkAccess,
      user,
      userMember
    } = item;

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
              struct_id: structId,
              creator_id: user.user_id
            }
          })
        : await this.repsRepository.findOne({
            where: {
              rep_id: repId,
              project_id: projectId,
              draft: common.BoolEnum.FALSE,
              struct_id: structId
            }
          });

    if (checkExist === true && common.isUndefined(rep)) {
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

    if (checkAccess === true && rep.draft === common.BoolEnum.FALSE) {
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

    return rep;
  }

  async getRepData(item: {
    traceId: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
    struct: entities.StructEntity;
    rep: entities.RepEntity;
    timezone: string;
    project: entities.ProjectEntity;
    envId: string;
    userMember: common.Member;
  }) {
    let {
      traceId,
      timeSpec,
      timeRangeFraction,
      struct,
      rep,
      timezone,
      project,
      envId,
      userMember
    } = item;

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
        struct_id: struct.struct_id
      }
    });

    let modelIds = metrics
      .filter(m => common.isDefined(m.model_id))
      .map(x => x.model_id);

    let models = await this.modelsRepository.find({
      where: {
        model_id: In(modelIds),
        struct_id: struct.struct_id
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

        let metric: entities.MetricEntity = metrics.find(
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
          structId: struct.struct_id,
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
          project_id: project.project_id
        }
      });
    }

    let mconfigs: entities.MconfigEntity[] = [];
    if (mconfigIds.length > 0) {
      mconfigs = await this.mconfigsRepository.find({
        where: {
          mconfig_id: In(mconfigIds),
          struct_id: struct.struct_id
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

    let repApi = wrapper.wrapToApiRep({
      rep: rep,
      member: userMember,
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

    return repApi;
  }
}
