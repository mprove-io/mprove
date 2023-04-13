import { Injectable } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { In } from 'typeorm';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { clearRowsCache } from '~backend/functions/clear-rows-cache';
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
    private kitsRepository: repositories.KitsRepository,
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
    rowChange: common.RowChange;
    rowIds: string[];
    metrics: entities.MetricEntity[];
    rows: common.Row[];
    changeType: common.ChangeTypeEnum;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFractionBrick: string;
    struct: entities.StructEntity;
  }) {
    let {
      rows,
      rowChange,
      rowIds,
      changeType,
      timezone,
      timeSpec,
      timeRangeFractionBrick,
      metrics,
      struct
    } = item;

    let processedRows: common.Row[] = rows.map(row => Object.assign({}, row));

    if (changeType === common.ChangeTypeEnum.AddEmpty) {
      let targetIndex: number;

      if (common.isDefined(rowChange.rowId)) {
        targetIndex = processedRows.findIndex(
          pRow => pRow.rowId === rowChange.rowId
        );
      }

      let rowIdsNumbers = processedRows.map(y =>
        common.rowIdLetterToNumber(y.rowId)
      );
      let maxRowIdNumber =
        rowIdsNumbers.length > 0 ? Math.max(...rowIdsNumbers) : undefined;
      let rowIdNumber = common.isDefined(maxRowIdNumber)
        ? maxRowIdNumber + 1
        : 0;
      let rowId = common.rowIdNumberToLetter(rowIdNumber);

      let newRow: common.Row = {
        rowId: rowId,
        rowType: common.RowTypeEnum.Empty,
        name: undefined,
        metricId: undefined,
        topLabel: undefined,
        partLabel: undefined,
        timeLabel: undefined,
        showChart: false,
        parameters: [],
        parametersFiltersWithExcludedTime: [],
        parametersJson: undefined,
        parametersFormula: undefined,
        formula: undefined,
        deps: undefined,
        rqs: [],
        isCalculateParameters: false,
        mconfig: undefined,
        query: undefined,
        hasAccessToModel: false,
        records: [],
        formatNumber: undefined,
        currencyPrefix: undefined,
        currencySuffix: undefined
      };

      processedRows.push(newRow);

      let targetRows: common.Row[] = [];

      if (common.isDefined(targetIndex)) {
        targetRows = [
          ...processedRows.slice(0, targetIndex + 1),
          newRow,
          ...processedRows.slice(targetIndex + 1, processedRows.length)
        ];

        targetRows.pop();
      }

      processedRows = processRowIds({
        rows: common.isDefined(targetIndex) ? targetRows : processedRows,
        targetRowIds: common.isDefined(targetIndex)
          ? targetRows.map(pRow => pRow.rowId)
          : processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.EditInfo) {
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
    } else if (changeType === common.ChangeTypeEnum.ConvertToHeader) {
      let pRow = processedRows.find(row => row.rowId === rowChange.rowId);

      let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
        rowType: common.RowTypeEnum.Header,
        name: rowChange.name
      });

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );
    } else if (changeType === common.ChangeTypeEnum.ConvertToMetric) {
      let metric: entities.MetricEntity = metrics.find(
        m => m.metric_id === rowChange.metricId
      );

      let editRow: common.Row = {
        rowId: rowChange.rowId,
        rowType: common.RowTypeEnum.Metric,
        name: undefined,
        metricId: metric.metric_id,
        topLabel: metric.top_label,
        partLabel: metric.part_label,
        timeLabel: metric.time_label,
        showChart: false,
        parameters: [],
        parametersFiltersWithExcludedTime: [],
        parametersJson: undefined,
        parametersFormula: undefined,
        formula: undefined,
        deps: undefined,
        rqs: [],
        isCalculateParameters: false,
        mconfig: undefined,
        query: undefined,
        hasAccessToModel: false,
        records: [],
        formatNumber: metric.format_number,
        currencyPrefix: metric.currency_prefix,
        currencySuffix: metric.currency_suffix
      };

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pr => pr.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.ConvertToFormula) {
      let editRow: common.Row = {
        rowId: rowChange.rowId,
        rowType: common.RowTypeEnum.Formula,
        name: rowChange.name,
        metricId: undefined,
        topLabel: undefined,
        partLabel: undefined,
        timeLabel: undefined,
        showChart: false,
        parameters: undefined,
        parametersFiltersWithExcludedTime: [],
        parametersJson: undefined,
        parametersFormula: undefined,
        deps: undefined,
        formula: rowChange.formula,
        rqs: [],
        isCalculateParameters: false,
        mconfig: undefined,
        query: undefined,
        hasAccessToModel: false,
        records: [],
        formatNumber: struct.format_number,
        currencyPrefix: struct.currency_prefix,
        currencySuffix: struct.currency_suffix
      };

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pr => pr.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.AddMetric) {
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

      let metric: entities.MetricEntity = metrics.find(
        m => m.metric_id === rowChange.metricId
      );

      let newRow: common.Row = {
        rowId: rowId,
        rowType: rowChange.rowType,
        name: undefined,
        metricId: rowChange.metricId,
        topLabel: metric.top_label,
        partLabel: metric.part_label,
        timeLabel: metric.time_label,
        showChart: rowChange.showChart,
        parameters: rowChange.parameters || [],
        parametersFiltersWithExcludedTime: [],
        parametersJson: undefined,
        parametersFormula: undefined,
        formula: undefined,
        deps: undefined,
        rqs: [],
        isCalculateParameters: false,
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

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.EditFormula) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: [rowChange.rowId],
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      let pRow = processedRows.find(r => r.rowId === rowChange.rowId);

      let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
        formula: rowChange.formula,
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
    } else if (changeType === common.ChangeTypeEnum.EditParameters) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: [rowChange.rowId],
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      let pRow = processedRows.find(r => r.rowId === rowChange.rowId);

      let editRow: common.Row = Object.assign({}, pRow, <common.Row>{
        parameters: rowChange.parameters,
        parametersFormula: rowChange.parametersFormula,
        rqs: [],
        isCalculateParameters: true,
        records: [],
        mconfig: undefined,
        query: undefined
      });

      processedRows = processedRows.map(row =>
        row.rowId === editRow.rowId ? editRow : row
      );

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pr => pr.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.Clear) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: rowIds,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      processedRows = processedRows.map(row => {
        if (rowIds.indexOf(row.rowId) > -1) {
          let emptyRow: common.Row = {
            rowId: row.rowId,
            rowType: common.RowTypeEnum.Empty,
            name: undefined,
            metricId: undefined,
            topLabel: undefined,
            partLabel: undefined,
            timeLabel: undefined,
            showChart: false,
            parameters: [],
            parametersFiltersWithExcludedTime: [],
            parametersJson: undefined,
            parametersFormula: undefined,
            formula: undefined,
            deps: undefined,
            rqs: [],
            isCalculateParameters: false,
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

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.Delete) {
      clearRowsCache({
        processedRows: processedRows,
        changedRowIds: rowIds,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick
      });

      processedRows = processedRows.filter(
        row => rowIds.indexOf(row.rowId) < 0
      );

      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: processedRows.map(pRow => pRow.rowId)
      });
    } else if (changeType === common.ChangeTypeEnum.Move) {
      processedRows = processRowIds({
        rows: processedRows,
        targetRowIds: rowIds
      });
    }

    return processedRows;
  }

  async getRep(item: {
    projectId: string;
    repId: string;
    structId: string;
    user: entities.UserEntity;
    userMember: entities.MemberEntity;
    checkExist: boolean;
    checkAccess: boolean;
  }) {
    let {
      projectId,
      repId,
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
        : await this.repsRepository.findOne({
            where: {
              project_id: projectId,
              struct_id: structId,
              rep_id: repId
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
        message:
          common.ErEnum.BACKEND_DRAFT_REPORT_IS_AVAILABLE_ONLY_TO_ITS_CREATOR
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
    timeRangeFractionBrick: string;
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
      timeRangeFractionBrick,
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

    let {
      columns,
      isTimeColumnsLimitExceeded,
      timeColumnsLimit,
      timeRangeFraction
    } = await this.blockmlService.getTimeColumns({
      traceId: traceId,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
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

    if (
      rep.rows.filter(
        row =>
          row.rowType === common.RowTypeEnum.Metric &&
          row.isCalculateParameters === true
      ).length > 0
    ) {
      console.log('isCalculateParameters true');

      rep.rows = await this.docService.calculateParameters({
        repId: rep.rep_id,
        structId: rep.struct_id,
        rows: rep.rows,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFraction: timeRangeFraction,
        models: models,
        metrics: metrics,
        traceId: traceId
      });
    } else {
      console.log('isCalculateParameters false');
    }

    let newMconfigs: common.Mconfig[] = [];
    let newQueries: common.Query[] = [];

    let mconfigIds: string[] = [];
    let queryIds: string[] = [];
    let kitIds: string[] = [];

    await forEachSeries(rep.rows, async x => {
      let rq = x.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      if (common.isDefined(rq)) {
        if (x.rowType === common.RowTypeEnum.Metric) {
          queryIds.push(rq.queryId);
          mconfigIds.push(rq.mconfigId);
        } else if (x.rowType === common.RowTypeEnum.Formula) {
          kitIds.push(rq.kitId);
        }
      } else {
        let newMconfig: common.Mconfig;
        let newQuery: common.Query;

        if (x.rowType === common.RowTypeEnum.Metric) {
          let newMconfigId = common.makeId();
          let newQueryId = common.makeId();

          let metric: entities.MetricEntity = metrics.find(
            m => m.metric_id === x.metricId
          );

          let model = models.find(ml => ml.model_id === metric.model_id);

          let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

          let timeFieldIdSpec = `${metric.timefield_id}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

          let timeSorting: common.Sorting = {
            desc: false,
            fieldId: timeFieldIdSpec
          };

          let timeFilter: common.Filter = {
            fieldId: timeFieldIdSpec,
            fractions: [timeRangeFraction]
          };

          let filters: common.Filter[] = [
            timeFilter,
            ...x.parametersFiltersWithExcludedTime
          ];

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
            filters: filters,
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
          kitId: undefined,
          lastCalculatedTs: 0
        };

        x.rqs.push(newRq);
      }
    });

    let mconfigs: entities.MconfigEntity[] = [];
    if (mconfigIds.length > 0) {
      mconfigs = await this.mconfigsRepository.find({
        where: {
          mconfig_id: In(mconfigIds),
          struct_id: struct.struct_id
        }
      });
    }

    let queries: entities.QueryEntity[] = [];
    if (queryIds.length > 0) {
      queries = await this.queriesRepository.find({
        where: {
          query_id: In(queryIds),
          project_id: project.project_id
        }
      });
    }

    let kits: entities.KitEntity[] = [];
    if (kitIds.length > 0) {
      kits = await this.kitsRepository.find({
        where: {
          kit_id: In(kitIds),
          struct_id: rep.struct_id
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

    let modelsApi = models.map(model =>
      wrapper.wrapToApiModel({
        model: model,
        hasAccess: helper.checkAccess({
          userAlias: user.alias,
          member: userMember,
          entity: model
        })
      })
    );

    rep.rows.forEach(x => {
      let rq = x.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      if (x.rowType === common.RowTypeEnum.Metric) {
        let newMconfigsEntities = newMconfigs.map(m =>
          wrapper.wrapToEntityMconfig(m)
        );

        let newMconfigsApi = newMconfigsEntities.map(y =>
          wrapper.wrapToApiMconfig({
            mconfig: y,
            modelFields: modelsApi.find(m => m.modelId === y.model_id).fields
          })
        );

        x.mconfig = [...mconfigsApi, ...newMconfigsApi].find(
          y => y.mconfigId === rq.mconfigId
        );

        x.query = [...queriesApi, ...newQueries].find(
          y => y.queryId === rq.queryId
        );
      }
    });

    let repApi = wrapper.wrapToApiRep({
      rep: rep,
      models: modelsApi,
      member: userMemberApi,
      columns: columns,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: columns.length,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded
    });

    let formulaRows = repApi.rows.filter(
      row => row.rowType === common.RowTypeEnum.Formula
    );

    let formulaRowsCalculated = formulaRows.filter(row => {
      let rq = row.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      return common.isDefined(rq) && rq.lastCalculatedTs > 0;
    });

    let queryRows = repApi.rows.filter(
      row => row.rowType === common.RowTypeEnum.Metric
    );

    let queryRowsCompleted = queryRows.filter(
      row => row.query.status === common.QueryStatusEnum.Completed
    );

    let queryRowsCompletedCalculated = queryRowsCompleted.filter(row => {
      let rq = row.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      return (
        common.isDefined(rq) && rq.lastCalculatedTs > row.query.lastCompleteTs
      );
    });

    let isCalculateData =
      rep.rep_id !== common.EMPTY_REP_ID &&
      queryRows.length === queryRowsCompleted.length &&
      (queryRowsCompleted.length !== queryRowsCompletedCalculated.length ||
        formulaRows.length !== formulaRowsCalculated.length);

    if (isCalculateData === true) {
      console.log('isCalculateData true');

      repApi = await this.docService.calculateData({
        rep: repApi,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFraction: timeRangeFraction,
        traceId: traceId
      });
    } else {
      console.log('isCalculateData false');

      let recordsByColumn = this.docService.makeRecordsByColumn({
        rep: repApi,
        timeSpec: timeSpec
      });

      repApi.rows.forEach(row => {
        let rq = row.rqs.find(
          y =>
            y.fractionBrick === timeRangeFraction.brick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        row.records = common.isDefined(row.query)
          ? recordsByColumn.map((y: any) => ({
              id: y.id,
              key: Number(y.fields.timestamp.toString().split('.')[0]),
              value: common.isDefined(y.fields)
                ? y.fields[row.rowId]
                : undefined,
              error: common.isDefined(y.errors)
                ? y.errors[row.rowId]
                : undefined
            }))
          : common.isDefined(rq.kitId)
          ? kits.find(k => k.kit_id === rq.kitId).data
          : [];
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
      isCalculateData === true ||
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
