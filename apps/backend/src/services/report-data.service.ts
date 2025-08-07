import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { getYYYYMMDDFromEpochUtcByTimezone } from '~node-common/functions/get-yyyymmdd-from-epoch-utc-by-timezone';
import { BlockmlService } from './blockml.service';
import { DocService } from './doc.service';
import { EnvsService } from './envs.service';
import { MalloyService } from './malloy.service';
import { MconfigsService } from './mconfigs.service';
import { RabbitService } from './rabbit.service';
import { WrapToApiService } from './wrap-to-api.service';
import { WrapToEntService } from './wrap-to-ent.service';

let retry = require('async-retry');

@Injectable()
export class ReportDataService {
  constructor(
    private envsService: EnvsService,
    private docService: DocService,
    private malloyService: MalloyService,
    private mconfigsService: MconfigsService,
    private blockmlService: BlockmlService,
    private rabbitService: RabbitService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getReportData(item: {
    traceId: string;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFractionBrick: string;
    struct: schemaPostgres.StructEnt;
    metrics: common.ModelMetric[];
    report: schemaPostgres.ReportEnt;
    // queryOperation?: common.QueryOperation;
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
      metrics,
      report,
      // queryOperation,
      timezone,
      project,
      envId,
      user,
      userMemberApi,
      userMember,
      isSaveToDb
    } = item;

    console.log('timeRangeFractionBrick');
    console.log(timeRangeFractionBrick);

    let {
      columns,
      isTimeColumnsLimitExceeded,
      timeColumnsLimit,
      timeRangeFraction,
      rangeOpen,
      rangeClose,
      rangeStart,
      rangeEnd
    } = await this.blockmlService.getTimeColumns({
      traceId: traceId,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      projectWeekStart: struct.weekStart,
      caseSensitiveStringFilters: struct.caseSensitiveStringFilters
    });

    let metricsStartDateYYYYMMDD = common.isUndefined(rangeStart)
      ? undefined
      : getYYYYMMDDFromEpochUtcByTimezone({
          timezone: timezone,
          secondsEpochUTC: rangeStart
          // secondsEpochUTC: columns[0].columnId
        });

    let metricsEndDateExcludedYYYYMMDD = common.isUndefined(rangeEnd)
      ? undefined
      : getYYYYMMDDFromEpochUtcByTimezone({
          timezone: timezone,
          secondsEpochUTC: rangeEnd
        });

    let metricsEndDateIncludedYYYYMMDD = common.isUndefined(rangeEnd)
      ? undefined
      : getYYYYMMDDFromEpochUtcByTimezone({
          timezone: timezone,
          secondsEpochUTC:
            rangeEnd - rangeStart >= 24 * 60 * 60
              ? rangeEnd - 24 * 60 * 60
              : rangeEnd
        });

    // let metricIds = report.rows
    //   .map(x => x.metricId)
    //   .filter(x => common.isDefined(x));

    let modelIds = metrics
      .filter(m => common.isDefined(m.modelId))
      .map(x => x.modelId);

    let models = await this.db.drizzle.query.modelsTable.findMany({
      where: and(
        inArray(modelsTable.modelId, modelIds),
        eq(modelsTable.structId, struct.structId)
      )
    });

    report.rows
      .filter(row => common.isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(rowParameter => {
          if (common.isDefined(rowParameter.listen)) {
            let reportField = report.fields.find(
              rField => rField.id === rowParameter.listen
            );

            if (common.isUndefined(reportField)) {
              delete rowParameter.listen;
            } else {
              rowParameter.fractions = reportField.fractions;
            }
          }
        });
      });

    report.rows
      .filter(
        row =>
          common.isDefined(row.parameters) && common.isDefined(row.metricId)
      )
      .forEach(row => {
        let metric: common.ModelMetric = metrics.find(
          m => m.metricId === row.metricId
        );

        let model = models.find(ml => ml.modelId === metric.modelId);

        if (model.type === common.ModelTypeEnum.Store) {
          // add required parameters
          (model.content as common.FileStore).fields
            .filter(x => x.fieldClass === common.FieldClassEnum.Filter)
            .forEach(storeFilter => {
              if (
                common.toBooleanFromLowercaseString(storeFilter.required) ===
                true
              ) {
                let selectedParameter = row.parameters.find(
                  x => x.apply_to === `${storeFilter.name}`
                );

                if (common.isUndefined(selectedParameter)) {
                  let newFraction: common.Fraction = {
                    type: common.FractionTypeEnum.StoreFraction,
                    controls: [] as any[],
                    brick: undefined as any,
                    operator: undefined as any
                  };

                  let newParameter: common.Parameter = {
                    apply_to: storeFilter.name,
                    fractions: [newFraction],
                    listen: undefined
                  };

                  row.parameters.push(newParameter);

                  selectedParameter = newParameter;
                }

                storeFilter.fraction_controls.forEach(storeFractionControl => {
                  let selectedControl =
                    selectedParameter.fractions[0].controls.find(
                      x => x.name === storeFractionControl.name
                    );

                  if (common.isUndefined(selectedControl)) {
                    let newControl: common.FractionControl = {
                      isMetricsDate: storeFractionControl.isMetricsDate,
                      options: storeFractionControl.options,
                      value: storeFractionControl.value,
                      label: storeFractionControl.label,
                      required: storeFractionControl.required,
                      name: storeFractionControl.name,
                      controlClass: storeFractionControl.controlClass
                    };

                    selectedParameter.fractions[0].controls.push(newControl);
                  }
                });
              }
            });
        }

        let filters: common.Filter[] = [];

        row.parameters.forEach(rowParameter => {
          let filter: common.Filter = {
            fieldId: rowParameter.apply_to,
            fractions: rowParameter.fractions
          };

          filters.push(filter);
        });

        row.parametersFiltersWithExcludedTime = filters;
      });

    let newMconfigs: common.Mconfig[] = [];
    let newQueries: common.Query[] = [];

    let mconfigIds: string[] = [];
    let queryIds: string[] = [];
    let kitIds: string[] = [];

    await forEachSeries(report.rows, async x => {
      let rq = x.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      // if (common.isDefined(rq)) {
      //   console.log('===')
      //   console.log('rq');
      //   console.log(rq);
      //   if (
      //     rq.timeStartTs !== columns[0].columnId ||
      //     rq.timeEndTs !== columns[columns.length - 1].columnId
      //   ) {
      //     console.log('filtered')
      //     x.rqs = x.rqs.filter(
      //       y =>
      //         !(
      //           y.fractionBrick === timeRangeFraction.brick &&
      //           y.timeSpec === timeSpec &&
      //           y.timezone === timezone
      //         )
      //     );
      //     rq = undefined;
      //   }
      // }

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

          let metric: common.ModelMetric = metrics.find(
            m => m.metricId === x.metricId
          );

          let model = models.find(ml => ml.modelId === metric.modelId);

          let timeFieldIdSpec;

          if (model.type === common.ModelTypeEnum.Store) {
            let timeSpecDetail = common.getTimeSpecDetail({
              timeSpec: timeSpec,
              weekStart: struct.weekStart
            });

            let storeField = (model.content as common.FileStore).fields.find(
              field =>
                field.time_group === metric.timeFieldId &&
                field.detail === timeSpecDetail
            );

            timeFieldIdSpec = storeField?.name;
          } else if (model.type === common.ModelTypeEnum.Malloy) {
            // console.log('metric');
            // console.log(metric);

            let timeSpecDetail = common.getTimeSpecDetail({
              timeSpec: timeSpec,
              weekStart: struct.weekStart
            });

            // console.log('timeSpecDetail');
            // console.log(timeSpecDetail);

            // {
            //   "id": "orders.created_at_day",
            //   "malloyFieldName": "created_at_day",
            //   "malloyFieldPath": [
            //       "orders"
            //   ],
            //   "malloyTags": [],
            //   "mproveTags": [
            //       {
            //           "key": "field_group",
            //           "value": "Created at"
            //       },
            //       {
            //           "key": "build_metrics"
            //       }
            //   ],
            //   "hidden": false,
            //   "required": false,
            //   "label": "Created at Day",
            //   "fieldClass": "dimension",
            //   "result": "ts",
            //   "buildMetrics": true,
            //   "timeframe": "day",
            //   "sqlName": "orders__created_at_day",
            //   "topId": "orders",
            //   "topLabel": "Orders"
            // }

            let mField = model.fields.find(
              field =>
                field.id === `${metric.timeFieldId}_${field.timeframe}` &&
                `${field.timeframe}s` === timeSpecDetail
            );

            timeFieldIdSpec = mField?.id;

            // console.log('timeFieldIdSpec');
            // console.log(timeFieldIdSpec);
          } else if (model.type === common.ModelTypeEnum.SQL) {
            let timeSpecWord = common.getTimeSpecWord({ timeSpec: timeSpec });

            timeFieldIdSpec = `${metric.timeFieldId}${common.TRIPLE_UNDERSCORE}${timeSpecWord}`;
          }

          let timeSorting: common.Sorting =
            // model.type === common.ModelTypeEnum.Store &&
            common.isUndefined(timeFieldIdSpec)
              ? undefined
              : {
                  desc: false,
                  fieldId: timeFieldIdSpec
                };

          let timeFilter: common.Filter =
            // model.type === common.ModelTypeEnum.Store &&
            common.isUndefined(timeFieldIdSpec)
              ? undefined
              : {
                  fieldId: timeFieldIdSpec,
                  fractions: [timeRangeFraction]
                };

          let filters: common.Filter[] =
            model.type === common.ModelTypeEnum.Store
              ? // TODO: store parametersFiltersWithExcludedTime
                [...x.parametersFiltersWithExcludedTime].sort((a, b) =>
                  a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
                )
              : [timeFilter, ...x.parametersFiltersWithExcludedTime].sort(
                  (a, b) =>
                    a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
                );

          // console.log('filters');
          // console.log(filters);

          let select = common.isUndefined(timeFieldIdSpec)
            ? []
            : [timeFieldIdSpec, metric.fieldId];

          let sortings = common.isUndefined(timeFieldIdSpec)
            ? []
            : [timeSorting];

          let sorts = common.isUndefined(timeFieldIdSpec)
            ? undefined
            : [
                  common.FractionTypeEnum.TsIsAfter,
                  common.FractionTypeEnum.TsIsAfterRelative
                ].indexOf(timeRangeFraction.type) > -1
              ? `${timeFieldIdSpec}`
              : `${timeFieldIdSpec} desc`;

          let mconfig: common.Mconfig = {
            structId: struct.structId,
            mconfigId: newMconfigId,
            queryId: newQueryId,
            modelId: model.modelId,
            modelType: model.type,
            dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
            storePart: undefined,
            modelLabel: model.label,
            modelFilePath: model.filePath,
            malloyQuery: undefined,
            compiledQuery: undefined,
            select: model.type === common.ModelTypeEnum.Malloy ? [] : select,
            unsafeSelect: [],
            warnSelect: [],
            joinAggregations: [],
            sortings:
              model.type === common.ModelTypeEnum.Malloy ? [] : sortings,
            sorts:
              model.type === common.ModelTypeEnum.Malloy ? undefined : sorts,
            timezone: timezone,
            limit:
              model.type === common.ModelTypeEnum.Malloy
                ? undefined
                : timeColumnsLimit,
            filters: model.type === common.ModelTypeEnum.Malloy ? [] : filters,
            chart: common.makeCopy(common.DEFAULT_CHART),
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

          // console.log('mconfig');
          // console.log(mconfig);

          // console.log('mconfig.filters');
          // console.log(mconfig.filters);

          // console.log('mconfig.filters[0]');
          // console.log(mconfig.filters[0]);

          let isError = false;

          if (model.type === common.ModelTypeEnum.Store) {
            // console.log('columns[0].columnId');
            // console.log(columns[0].columnId);

            // console.log('getRepData prepStoreMconfigQuery');

            let mqe = await this.mconfigsService.prepStoreMconfigQuery({
              struct: struct,
              project: project,
              envId: envId,
              model: model,
              mconfig: mconfig,
              metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
              metricsEndDateYYYYMMDD:
                mconfig.dateRangeIncludesRightSide === true
                  ? metricsEndDateIncludedYYYYMMDD
                  : metricsEndDateExcludedYYYYMMDD
            });

            newMconfig = mqe.newMconfig;
            newQuery = mqe.newQuery;
            isError = mqe.isError;

            if (newMconfig.select.length === 0) {
              newQuery.status = common.QueryStatusEnum.Completed;
              newQuery.data = [];
            }
          } else if (model.type === common.ModelTypeEnum.Malloy) {
            let editMalloyQueryResultStep1 =
              await this.malloyService.editMalloyQuery({
                projectId: project.projectId,
                envId: envId,
                structId: struct.structId,
                model: model,
                mconfig: mconfig,
                queryOperations: [
                  {
                    type: common.QueryOperationTypeEnum
                      .GroupOrAggregatePlusSort,
                    timezone: timezone,
                    fieldId: select[0],
                    sortFieldId: select[0],
                    desc: false
                  },
                  {
                    type: common.QueryOperationTypeEnum.GroupOrAggregate,
                    timezone: timezone,
                    fieldId: select[1]
                  },
                  {
                    type: common.QueryOperationTypeEnum.Limit,
                    timezone: timezone,
                    limit: timeColumnsLimit
                  },
                  ...filters.map(filter => ({
                    type: common.QueryOperationTypeEnum.WhereOrHaving,
                    timezone: timezone,
                    fieldId: filter.fieldId,
                    filters: [filter]
                  }))
                ]
              });

            newMconfig = editMalloyQueryResultStep1.newMconfig;
            newQuery = editMalloyQueryResultStep1.newQuery;
            isError = editMalloyQueryResultStep1.isError;

            console.log('newMconfig');
            console.log(newMconfig);
            console.log('newQuery');
            console.log(newQuery);
            console.log('isError');
            console.log(isError);
          } else {
            let { apiEnv, connectionsWithFallback } =
              await this.envsService.getApiEnvConnectionsWithFallback({
                projectId: project.projectId,
                envId: envId
              });

            let toBlockmlProcessQueryRequest: apiToBlockml.ToBlockmlProcessQueryRequest =
              {
                info: {
                  name: apiToBlockml.ToBlockmlRequestInfoNameEnum
                    .ToBlockmlProcessQuery,
                  traceId: traceId
                },
                payload: {
                  projectId: project.projectId,
                  weekStart: struct.weekStart,
                  caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
                  simplifySafeAggregates: struct.simplifySafeAggregates,
                  udfsDict: struct.udfsDict,
                  mconfig: mconfig,
                  modelContent: model.content,
                  malloyModelDef: model.malloyModelDef,
                  envId: envId,
                  connections: connectionsWithFallback
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
          }

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
    }

    let queries: schemaPostgres.QueryEnt[] = [];
    if (queryIds.length > 0) {
      queries = await this.db.drizzle.query.queriesTable.findMany({
        where: and(
          inArray(queriesTable.queryId, queryIds),
          eq(queriesTable.projectId, project.projectId)
        )
      });
    }

    let kits: schemaPostgres.KitEnt[] = [];
    if (kitIds.length > 0) {
      kits = await this.db.drizzle.query.kitsTable.findMany({
        where: and(
          inArray(kitsTable.kitId, kitIds),
          eq(kitsTable.structId, report.structId)
        )
      });
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

    report.rows.forEach(x => {
      let rq = x.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      if (x.rowType === common.RowTypeEnum.Metric) {
        let newMconfigsEnts = newMconfigs.map(m =>
          this.wrapToEntService.wrapToEntityMconfig(m)
        );

        let newMconfigsApi = newMconfigsEnts.map(y =>
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

    let reportApi = this.wrapToApiService.wrapToApiReport({
      report: report,
      models: modelsApi,
      member: userMemberApi,
      columns: columns,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      rangeOpen: rangeOpen,
      rangeClose: rangeClose,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD: metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD: metricsEndDateIncludedYYYYMMDD,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: columns.length,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded
    });

    let formulaRows = reportApi.rows.filter(
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

    let queryRows = reportApi.rows.filter(
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
      report.reportId !== common.EMPTY_REPORT_ID &&
      queryRows.length === queryRowsCompleted.length &&
      (queryRowsCompleted.length !== queryRowsCompletedCalculated.length ||
        formulaRows.length !== formulaRowsCalculated.length);

    if (isCalculateData === true) {
      // console.log('isCalculateData true');

      reportApi = await this.docService.calculateData({
        report: reportApi,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFraction: timeRangeFraction,
        traceId: traceId
      });
    } else {
      // console.log('isCalculateData false');

      let reportDataColumns = this.docService.makeReportDataColumns({
        report: reportApi,
        timeSpec: timeSpec
      });

      reportApi.rows.forEach(row => {
        let rq = row.rqs.find(
          y =>
            y.fractionBrick === timeRangeFraction.brick &&
            y.timeSpec === timeSpec &&
            y.timezone === timezone
        );

        row.records = common.isDefined(row.query)
          ? reportDataColumns.map(y => {
              let unixTimeZoned = y.fields.timestamp;
              // let unixDateZoned = new Date(unixTimeZoned * 1000);
              // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

              let record: common.RowRecord = {
                id: y.id,
                columnLabel: undefined,
                key: unixTimeZoned,
                // tsUTC: tsUTC,
                value: common.isDefined(y.fields)
                  ? y.fields[row.rowId]
                  : undefined,
                error:
                  // common.isDefined(y.errors)
                  //   ? y.errors[row.rowId]
                  //   :
                  undefined
              };

              return record;
            })
          : common.isDefined(rq.kitId)
            ? (kits.find(k => k.kitId === rq.kitId)?.data as any[]) || []
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
                    this.wrapToEntService.wrapToEntityMconfig(x)
                  )
                },
                insertOrDoNothing: {
                  queries: newQueries.map(x =>
                    this.wrapToEntService.wrapToEntityQuery(x)
                  )
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    if (
      isSaveToDb === true ||
      isCalculateData === true ||
      newMconfigs.length > 0 ||
      newQueries.length > 0
    ) {
      let dbRows = common.makeCopy(report.rows);

      dbRows.forEach(x => {
        delete x.mconfig;
        delete x.query;
      });

      report.rows = dbRows;

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  reports: [report]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    return reportApi;
  }
}
