import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getUnixTime } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { kitsTable } from '~backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { metricsTable } from '~backend/drizzle/postgres/schema/metrics';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { clearRowsCache } from '~backend/functions/clear-rows-cache';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { processRowIds } from '~backend/functions/process-row-ids';
import { BlockmlService } from './blockml.service';
import { DocService } from './doc.service';
import { MakerService } from './maker.service';
import { RabbitService } from './rabbit.service';
import { WrapToApiService } from './wrap-to-api.service';
import { WrapToEntService } from './wrap-to-ent.service';

let retry = require('async-retry');

@Injectable()
export class ReportsService {
  constructor(
    private wrapToApiService: WrapToApiService,
    private wapToEntService: WrapToEntService,
    private makerService: MakerService,
    private docService: DocService,
    private blockmlService: BlockmlService,
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getRepCheckExists(item: { repId: string; structId: string }) {
    let { repId, structId } = item;

    let rep = await this.db.drizzle.query.reportsTable.findFirst({
      where: and(
        eq(reportsTable.structId, structId),
        eq(reportsTable.reportId, repId)
      )
    });

    // let rep = await this.repsRepository.findOne({
    //   where: {
    //     struct_id: structId,
    //     rep_id: repId
    //   }
    // });

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
    metrics: schemaPostgres.MetricEnt[];
    rows: common.Row[];
    changeType: common.ChangeTypeEnum;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFractionBrick: string;
    struct: schemaPostgres.StructEnt;
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
        partNodeLabel: undefined,
        partFieldLabel: undefined,
        partLabel: undefined,
        timeNodeLabel: undefined,
        timeFieldLabel: undefined,
        timeLabel: undefined,
        showChart: false,
        parameters: [],
        parametersFiltersWithExcludedTime: [],
        parametersJson: undefined,
        parametersFormula: undefined,
        formula: undefined,
        deps: undefined,
        xDeps: undefined,
        formulaDeps: undefined,
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
      let metric: schemaPostgres.MetricEnt = metrics.find(
        m => m.metricId === rowChange.metricId
      );

      let editRow: common.Row = {
        rowId: rowChange.rowId,
        rowType: common.RowTypeEnum.Metric,
        name: undefined,
        metricId: metric.metricId,
        topLabel: metric.topLabel,
        partNodeLabel: metric.partNodeLabel,
        partFieldLabel: metric.partFieldLabel,
        partLabel: metric.partLabel,
        timeNodeLabel: metric.timeNodeLabel,
        timeFieldLabel: metric.timeFieldLabel,
        timeLabel: metric.timeLabel,
        showChart: false,
        parameters: [],
        parametersFiltersWithExcludedTime: [],
        parametersJson: undefined,
        parametersFormula: undefined,
        formula: undefined,
        deps: undefined,
        formulaDeps: undefined,
        xDeps: undefined,
        rqs: [],
        isCalculateParameters: false,
        mconfig: undefined,
        query: undefined,
        hasAccessToModel: false,
        records: [],
        formatNumber: metric.formatNumber,
        currencyPrefix: metric.currencyPrefix,
        currencySuffix: metric.currencySuffix
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
        partNodeLabel: undefined,
        partFieldLabel: undefined,
        partLabel: undefined,
        timeNodeLabel: undefined,
        timeFieldLabel: undefined,
        timeLabel: undefined,
        showChart: false,
        parameters: undefined,
        parametersFiltersWithExcludedTime: [],
        parametersJson: undefined,
        parametersFormula: undefined,
        deps: undefined,
        formulaDeps: undefined,
        xDeps: undefined,
        formula: rowChange.formula,
        rqs: [],
        isCalculateParameters: false,
        mconfig: undefined,
        query: undefined,
        hasAccessToModel: false,
        records: [],
        formatNumber: struct.formatNumber,
        currencyPrefix: struct.currencyPrefix,
        currencySuffix: struct.currencySuffix
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

      let metric: schemaPostgres.MetricEnt = metrics.find(
        m => m.metricId === rowChange.metricId
      );

      let newRow: common.Row = {
        rowId: rowId,
        rowType: rowChange.rowType,
        name: undefined,
        metricId: rowChange.metricId,
        topLabel: metric.topLabel,
        partNodeLabel: metric.partNodeLabel,
        partFieldLabel: metric.partFieldLabel,
        partLabel: metric.partLabel,
        timeNodeLabel: metric.timeNodeLabel,
        timeFieldLabel: metric.timeFieldLabel,
        timeLabel: metric.timeLabel,
        showChart: rowChange.showChart,
        parameters: common.isDefined(rowChange.parameters)
          ? rowChange.parameters
          : [],
        parametersFiltersWithExcludedTime: [],
        parametersJson: undefined,
        parametersFormula: undefined,
        formula: undefined,
        deps: undefined,
        formulaDeps: undefined,
        xDeps: undefined,
        rqs: [],
        isCalculateParameters: false,
        mconfig: undefined,
        query: undefined,
        hasAccessToModel: false,
        records: [],
        formatNumber: metric.formatNumber,
        currencyPrefix: metric.currencyPrefix,
        currencySuffix: metric.currencySuffix
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
            partNodeLabel: undefined,
            partFieldLabel: undefined,
            partLabel: undefined,
            timeNodeLabel: undefined,
            timeFieldLabel: undefined,
            timeLabel: undefined,
            showChart: false,
            parameters: [],
            parametersFiltersWithExcludedTime: [],
            parametersJson: undefined,
            parametersFormula: undefined,
            formula: undefined,
            deps: undefined,
            xDeps: undefined,
            formulaDeps: undefined,
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
        targetRowIds: processedRows.map(pRow => pRow.rowId),
        replaceWithUndef: rowIds
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
    user: schemaPostgres.UserEnt;
    userMember: schemaPostgres.MemberEnt;
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

    let emptyRep = this.makerService.makeReport({
      structId: undefined,
      reportId: repId,
      projectId: projectId,
      creatorId: undefined,
      filePath: undefined,
      accessRoles: [],
      accessUsers: [],
      title: repId,
      rows: [],
      draft: false
    });

    // let emptyRep: schemaPostgres.ReportEnt = {
    //   projectId: projectId,
    //   structId: undefined,
    //   reportId: repId,
    //   creatorId: undefined,
    //   draft: false,
    //   filePath: undefined,
    //   title: repId,
    //   accessRoles: [],
    //   accessUsers: [],
    //   rows: [],
    //   draftCreatedTs: undefined,
    //   serverTs: undefined
    // };

    let rep =
      repId === common.EMPTY_REP_ID
        ? emptyRep
        : await this.db.drizzle.query.reportsTable.findFirst({
            where: and(
              eq(reportsTable.projectId, projectId),
              eq(reportsTable.structId, structId),
              eq(reportsTable.reportId, repId)
            )
          });

    // await this.repsRepository.findOne({
    //     where: {
    //       project_id: projectId,
    //       struct_id: structId,
    //       rep_id: repId
    //     }
    //   });
    if (checkExist === true && common.isUndefined(rep)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REP_NOT_FOUND
      });
    }

    if (
      repId !== common.EMPTY_REP_ID &&
      rep.draft === true &&
      rep.creatorId !== user.userId
    ) {
      throw new common.ServerError({
        message:
          common.ErEnum.BACKEND_DRAFT_TILE_IS_AVAILABLE_ONLY_TO_ITS_CREATOR
      });
    }

    if (checkAccess === true && rep.draft === false) {
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
    struct: schemaPostgres.StructEnt;
    rep: schemaPostgres.ReportEnt;
    project: schemaPostgres.ProjectEnt;
    envId: string;
    userMemberApi: common.Member;
    userMember: schemaPostgres.MemberEnt;
    user: schemaPostgres.UserEnt;
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
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      projectWeekStart: struct.weekStart
    });

    let metricIds = rep.rows.map(x => x.metricId);

    let metrics = await this.db.drizzle.query.metricsTable.findMany({
      where: and(
        inArray(metricsTable.metricId, metricIds),
        eq(metricsTable.structId, struct.structId)
      )
    });

    // let metrics = await this.metricsRepository.find({
    //   where: {
    //     metric_id: In(metricIds),
    //     struct_id: struct.struct_id
    //   }
    // });

    let modelIds = metrics
      .filter(m => common.isDefined(m.modelId))
      .map(x => x.modelId);

    let models = await this.db.drizzle.query.modelsTable.findMany({
      where: and(
        inArray(modelsTable.modelId, modelIds),
        eq(modelsTable.structId, struct.structId)
      )
    });

    // let models = await this.modelsRepository.find({
    //   where: {
    //     model_id: In(modelIds),
    //     struct_id: struct.struct_id
    //   }
    // });

    if (
      rep.rows.filter(
        row =>
          row.rowType === common.RowTypeEnum.Metric &&
          row.isCalculateParameters === true
      ).length > 0
    ) {
      console.log('isCalculateParameters true');

      rep.rows = await this.docService.calculateParameters({
        rows: rep.rows,
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

      // stage 1
      if (common.isDefined(rq)) {
        if (
          rq.timeStartTs !== columns[0].columnId ||
          rq.timeEndTs !== columns[columns.length - 1].columnId
        ) {
          x.rqs = x.rqs.filter(
            y =>
              !(
                y.fractionBrick === timeRangeFraction.brick &&
                y.timeSpec === timeSpec &&
                y.timezone === timezone
              )
          );
          rq = undefined;
        }
      }

      // stage 2
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

          let metric: schemaPostgres.MetricEnt = metrics.find(
            m => m.metricId === x.metricId
          );

          let model = models.find(ml => ml.modelId === metric.modelId);

          let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

          let timeFieldIdSpec = `${metric.timefieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;

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
          ].sort((a, b) =>
            a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
          );

          let mconfig: common.Mconfig = {
            structId: struct.structId,
            mconfigId: newMconfigId,
            queryId: newQueryId,
            modelId: model.modelId,
            modelLabel: model.label,
            select: [timeFieldIdSpec, metric.fieldId],
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
                orgId: project.orgId,
                projectId: project.projectId,
                weekStart: struct.weekStart,
                udfsDict: struct.udfsDict,
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
          timeStartTs: columns[0].columnId,
          timeEndTs: columns[columns.length - 1].columnId,
          mconfigId: newMconfig?.mconfigId,
          queryId: newMconfig?.queryId,
          kitId: undefined,
          lastCalculatedTs: 0
        };

        x.rqs.push(newRq);
      }
    });

    let mconfigs: schemaPostgres.MconfigEnt[] = [];
    if (mconfigIds.length > 0) {
      mconfigs = await this.db.drizzle.query.mconfigsTable.findMany({
        where: and(
          inArray(mconfigsTable.mconfigId, mconfigIds),
          eq(mconfigsTable.structId, struct.structId)
        )
      });

      // mconfigs = await this.mconfigsRepository.find({
      //   where: {
      //     mconfig_id: In(mconfigIds),
      //     struct_id: struct.struct_id
      //   }
      // });
    }

    let queries: schemaPostgres.QueryEnt[] = [];
    if (queryIds.length > 0) {
      queries = await this.db.drizzle.query.queriesTable.findMany({
        where: and(
          inArray(queriesTable.queryId, queryIds),
          eq(queriesTable.projectId, project.projectId)
        )
      });

      // queries = await this.queriesRepository.find({
      //   where: {
      //     query_id: In(queryIds),
      //     project_id: project.project_id
      //   }
      // });
    }

    let kits: schemaPostgres.KitEnt[] = [];
    if (kitIds.length > 0) {
      kits = await this.db.drizzle.query.kitsTable.findMany({
        where: and(
          inArray(kitsTable.kitId, kitIds),
          eq(kitsTable.structId, rep.structId)
        )
      });

      // kits = await this.kitsRepository.find({
      //   where: {
      //     kit_id: In(kitIds),
      //     struct_id: rep.struct_id
      //   }
      // });
    }

    let queriesApi = queries.map(x => this.wrapToApiService.wrapToApiQuery(x));

    let mconfigsApi = mconfigs.map(x =>
      this.wrapToApiService.wrapToApiMconfig({
        mconfig: x,
        modelFields: models.find(m => m.modelId === x.modelId).fields
      })
    );

    let modelsApi = models.map(model =>
      this.wrapToApiService.wrapToApiModel({
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
          this.wapToEntService.wrapToEntityMconfig({ mconfig: m })
        );

        let newMconfigsApi = newMconfigsEntities.map(y =>
          this.wrapToApiService.wrapToApiMconfig({
            mconfig: y,
            modelFields: modelsApi.find(m => m.modelId === y.modelId).fields
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

    let repApi = this.wrapToApiService.wrapToApiRep({
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
      rep.reportId !== common.EMPTY_REP_ID &&
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
          ? recordsByColumn.map((y: any) => {
              let unixTimeZoned = Number(
                y.fields.timestamp.toString().split('.')[0]
              );
              let unixDateZoned = new Date(unixTimeZoned * 1000);
              let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

              let record = {
                id: y.id,
                key: unixTimeZoned,
                tsUTC: tsUTC,
                value: common.isDefined(y.fields)
                  ? y.fields[row.rowId]
                  : undefined,
                error: common.isDefined(y.errors)
                  ? y.errors[row.rowId]
                  : undefined
              };

              return record;
            })
          : common.isDefined(rq.kitId)
          ? (kits.find(k => k.kitId === rq.kitId).data as any[])
          : [];
      });
    }

    if (newMconfigs.length > 0 || newQueries.length > 0) {
      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insert: {
                  mconfigs: newMconfigs.map(x =>
                    this.wapToEntService.wrapToEntityMconfig({ mconfig: x })
                  ),
                  queries: newQueries.map(x =>
                    this.wapToEntService.wrapToEntityQuery({ query: x })
                  )
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );

      // await this.dbService.writeRecords({
      //   modify: false,
      //   records: {
      //     mconfigs: newMconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
      //     queries: newQueries.map(x => wrapper.wrapToEntityQuery(x))
      //   }
      // });
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

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  reports: [rep]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );

      // await this.dbService.writeRecords({
      //   modify: true,
      //   records: {
      //     reps: [rep]
      //   }
      // });
    }

    return repApi;
  }
}
