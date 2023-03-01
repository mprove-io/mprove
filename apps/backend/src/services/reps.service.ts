import { Injectable } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { In } from 'typeorm';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { processRowIds } from '~backend/functions/process-row-ids';
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

  getProcessedRows(item: {
    rowChanges: common.RowChange[];
    metrics: entities.MetricEntity[];
    rows: common.Row[];
    changeType: common.ChangeTypeEnum;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
  }) {
    let {
      rows,
      rowChanges,
      changeType,
      timezone,
      timeSpec,
      timeRangeFraction,
      metrics
    } = item;

    let processedRows = rows.map(row => Object.assign({}, row));

    if (changeType === common.ChangeTypeEnum.AddMetric) {
      rowChanges.forEach(rowChange => {
        let isClearFormulasData =
          processedRows.filter(
            row =>
              common.isDefined(row.formula) &&
              row.formulaDeps.findIndex(dep => dep === rowChange.rowId) > -1
          ).length > 0;

        if (isClearFormulasData === true) {
          processedRows
            .filter(row => common.isDefined(row.formula))
            .forEach(row => {
              let rq = row.rqs.find(
                y =>
                  y.fractionBrick === timeRangeFraction.brick &&
                  y.timeSpec === timeSpec &&
                  y.timezone === timezone
              );
              if (common.isDefined(rq)) {
                rq.records = [];
              }
            });
        }

        let rowId = rowChange.rowId;

        if (common.isUndefined(rowId)) {
          let rowIdsNumbers = processedRows.map(y =>
            common.rowIdLetterToNumber(y.rowId)
          );
          let maxRowIdNumber =
            rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;
          let rowIdNumber = common.isDefined(maxRowIdNumber)
            ? maxRowIdNumber + 1
            : 0;
          rowId = common.rowIdNumberToLetter(rowIdNumber);
        }

        let metric = metrics.find(m => m.metric_id === rowChange.metricId);

        let newRow: common.Row = {
          rowId: rowId,
          rowType: rowChange.rowType,
          name: metric.label,
          metricId: rowChange.metricId,
          showChart: rowChange.showChart,
          params: rowChange.params || [],
          formula: undefined,
          formulaDeps: undefined,
          rqs: [],
          mconfig: undefined,
          query: undefined,
          hasAccessToModel: false,
          records: [],
          formatNumber: metric.format_number,
          currencyPrefix: metric.currency_prefix,
          currencySuffix: metric.currency_suffix
        };

        if (common.isDefined(rowChange.rowId)) {
          let rowIndex = processedRows.findIndex(
            r => r.rowId === rowChange.rowId
          );

          let newProcessedRows = [
            ...processedRows.slice(0, rowIndex),
            newRow,
            ...processedRows.slice(rowIndex + 1)
          ];

          processedRows = newProcessedRows;
        } else {
          processedRows.push(newRow);
        }
      });

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.Clear) {
      rowChanges.forEach(rowChange => {
        processedRows.forEach(row => {
          if (
            common.isDefined(row.formula) &&
            row.formulaDeps.findIndex(dep => dep === rowChange.rowId) > -1
          ) {
            let rq = row.rqs.find(
              y =>
                y.fractionBrick === timeRangeFraction.brick &&
                y.timeSpec === timeSpec &&
                y.timezone === timezone
            );

            rq.lastCalculatedTs = 0;
          }
        });
      });

      processedRows = processedRows.map(row => {
        if (rowChanges.map(rc => rc.rowId).indexOf(row.rowId) > -1) {
          let emptyRow: common.Row = {
            rowId: row.rowId,
            rowType: common.RowTypeEnum.Empty,
            name: undefined,
            metricId: undefined,
            showChart: false,
            params: [],
            formula: undefined,
            formulaDeps: undefined,
            rqs: [],
            mconfig: undefined,
            query: undefined,
            hasAccessToModel: false,
            records: [],
            formatNumber: undefined,
            currencyPrefix: undefined,
            currencySuffix: undefined
          };

          return emptyRow;
        } else {
          return row;
        }
      });
    } else if (changeType === common.ChangeTypeEnum.EditInfo) {
      let rowChange = rowChanges[0];

      let pRow = processedRows.find(row => row.rowId === rowChange.rowId);

      let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
        showChart: common.isDefined(rowChange.showChart)
          ? rowChange.showChart
          : pRow.showChart,
        name: common.isDefined(rowChange.name) ? rowChange.name : pRow.name,
        formatNumber: common.isDefined(rowChange.formatNumber)
          ? rowChange.formatNumber
          : pRow.formatNumber,
        currencyPrefix: common.isDefined(rowChange.currencyPrefix)
          ? rowChange.currencyPrefix
          : pRow.currencyPrefix,
        currencySuffix: common.isDefined(rowChange.currencySuffix)
          ? rowChange.currencySuffix
          : pRow.currencySuffix
      });

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );
    } else if (changeType === common.ChangeTypeEnum.EditFormula) {
      let rowChange = rowChanges[0];

      let pRow = processedRows.find(r => r.rowId === rowChange.rowId);

      processedRows.forEach(row => {
        if (
          common.isDefined(row.formula) &&
          row.formulaDeps.findIndex(dep => dep === rowChange.rowId) > -1
        ) {
          let rq = row.rqs.find(
            y =>
              y.fractionBrick === timeRangeFraction.brick &&
              y.timeSpec === timeSpec &&
              y.timezone === timezone
          );

          rq.lastCalculatedTs = 0;
        }
      });

      let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
        formula: rowChange.formula,
        formulaDeps: undefined,
        rqs: [],
        records: []
      });

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pr => pr.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.EditParams) {
      let rowChange = rowChanges[0];

      let pRow = processedRows.find(r => r.rowId === rowChange.rowId);

      processedRows.forEach(row => {
        if (
          common.isDefined(row.formula) &&
          row.formulaDeps.findIndex(dep => dep === rowChange.rowId) > -1
        ) {
          let rq = row.rqs.find(
            y =>
              y.fractionBrick === timeRangeFraction.brick &&
              y.timeSpec === timeSpec &&
              y.timezone === timezone
          );

          rq.lastCalculatedTs = 0;
        }
      });

      let metric = metrics.find(m => m.metric_id === rowChange.metricId);

      let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
        params: rowChange.params,
        rqs: [],
        records: [],
        mconfig: undefined,
        query: undefined
      });

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );
    } else if (changeType === common.ChangeTypeEnum.Delete) {
      rowChanges.forEach(rowChange => {
        processedRows.forEach(row => {
          if (
            common.isDefined(row.formula) &&
            row.formulaDeps.findIndex(dep => dep === rowChange.rowId) > -1
          ) {
            let rq = row.rqs.find(
              y =>
                y.fractionBrick === timeRangeFraction.brick &&
                y.timeSpec === timeSpec &&
                y.timezone === timezone
            );

            rq.lastCalculatedTs = 0;
          }
        });
      });

      processedRows = processedRows.filter(
        row =>
          rowChanges.map(rowChange => rowChange.rowId).indexOf(row.rowId) < 0
      );

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.Move) {
      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: rowChanges.map(rc => rc.rowId)
      });
    }

    return processedRows;
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
      repId === common.EMPTY_REP_ID
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
      repId !== common.EMPTY_REP_ID &&
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
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFraction: common.Fraction;
    struct: entities.StructEntity;
    rep: entities.RepEntity;
    project: entities.ProjectEntity;
    envId: string;
    userMemberApi: common.Member;
    userMember: entities.MemberEntity;
    user: entities.UserEntity;
    isSaveToDb?: boolean;
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
      user,
      userMemberApi,
      userMember,
      isSaveToDb
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

    await forEachSeries(
      rep.rows.filter(x => common.isDefined(x.metricId)),
      async x => {
        let rq = x.rqs.find(
          y =>
            y.fractionBrick === timeRangeFraction.brick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        if (common.isDefined(rq)) {
          queryIds.push(rq.queryId);
          mconfigIds.push(rq.mconfigId);
        } else {
          let newMconfig;
          let newQuery;

          if (common.isUndefined(x.formula)) {
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

            mconfig.chart.type = common.ChartTypeEnum.Line;

            mconfig = common.setChartTitleOnSelectChange({
              mconfig: mconfig,
              fields: model.fields
            });

            mconfig = common.setChartFields({
              mconfig: mconfig,
              fields: model.fields
            });

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

            newMconfig = blockmlProcessQueryResponse.payload.mconfig;
            newQuery = blockmlProcessQueryResponse.payload.query;

            newMconfig.queryId = newQueryId;
            newQuery.queryId = newQueryId;

            newMconfigs.push(newMconfig);
            newQueries.push(newQuery);
          }

          let newRq: common.Rq = {
            fractionBrick: timeRangeFraction.brick,
            timeSpec: timeSpec,
            timezone: timezone,
            mconfigId: newMconfig?.mconfigId,
            queryId: newMconfig?.queryId,
            records: [],
            lastCalculatedTs: 0
          };

          x.rqs.push(newRq);
        }
      }
    );

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

    rep.rows.forEach(x => {
      let rq = x.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      if (common.isDefined(rq) && common.isUndefined(x.formula)) {
        x.mconfig = [...mconfigsApi, ...newMconfigs].find(
          y => y.mconfigId === rq.mconfigId
        );

        x.query = [...queriesApi, ...newQueries].find(
          y => y.queryId === rq.queryId
        );
      }
    });

    let repApi = wrapper.wrapToApiRep({
      rep: rep,
      models: models.map(model =>
        wrapper.wrapToApiModel({
          model: model,
          hasAccess: helper.checkAccess({
            userAlias: user.alias,
            member: userMember,
            entity: model
          })
        })
      ),
      member: userMemberApi,
      columns: columns,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: columns.length,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded
    });

    let rowsWithNotCalculatedFormulas = repApi.rows.filter(row => {
      if (common.isUndefined(row.formula)) {
        return false;
      }

      let rq = row.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      if (common.isUndefined(rq)) {
        return true;
      } else {
        return rq.lastCalculatedTs === 0;
      }
    });

    let rowsWithQueries = repApi.rows.filter(row =>
      common.isDefined(row.query)
    );

    let completedRows = rowsWithQueries.filter(
      row => row.query.status === common.QueryStatusEnum.Completed
    );

    let calculatedRows = completedRows.filter(row => {
      let rq = row.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      return rq.lastCalculatedTs === row.query.lastCompleteTs;
    });

    let isCalculate =
      rep.rep_id !== common.EMPTY_REP_ID &&
      rowsWithQueries.length === completedRows.length &&
      (completedRows.length !== calculatedRows.length ||
        rowsWithNotCalculatedFormulas.length > 0);

    if (isCalculate === true) {
      console.log('isCalculate true');

      repApi = await this.docService.getData({
        rep: repApi,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFraction: timeRangeFraction
      });
    } else {
      console.log('isCalculate false');

      let dataRecords = this.docService.makeDataRecords({
        rep: repApi,
        timeSpec: timeSpec
      });

      repApi.rows.forEach(x => {
        let rq = x.rqs.find(
          y =>
            y.fractionBrick === timeRangeFraction.brick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        if (common.isDefined(x.query)) {
          if (rq.lastCalculatedTs !== x.query.lastCompleteTs) {
            rq.records = dataRecords.map((y: any) => ({
              id: y.id,
              key: y.fields.timestamp,
              value: common.isDefined(y.fields) ? y.fields[x.rowId] : undefined,
              error: common.isDefined(y.errors) ? y.errors[x.rowId] : undefined
            }));
          }
        }

        x.records = rq?.records || [];
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
      isSaveToDb === true ||
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
