import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  KitTab,
  MconfigTab,
  MemberTab,
  ProjectTab,
  QueryTab,
  ReportTab,
  StructTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { kitsTable } from '~backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import { EMPTY_REPORT_ID } from '~common/constants/top';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { DetailUnitEnum } from '~common/enums/detail-unit.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '~common/enums/query-operation-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { getTimeSpecDetail } from '~common/functions/get-timespec-detail';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { setChartFields } from '~common/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '~common/functions/set-chart-title-on-select-change';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { Member } from '~common/interfaces/backend/member';
import { Filter } from '~common/interfaces/blockml/filter';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { Parameter } from '~common/interfaces/blockml/parameter';
import { RowRecord } from '~common/interfaces/blockml/row-record';
import { Rq } from '~common/interfaces/blockml/rq';
import { Sorting } from '~common/interfaces/blockml/sorting';
import { getYYYYMMDDFromEpochUtcByTimezone } from '~node-common/functions/get-yyyymmdd-from-epoch-utc-by-timezone';
import { KitsService } from './db/kits.service';
import { MconfigsService } from './db/mconfigs.service';
import { ModelsService } from './db/models.service';
import { QueriesService } from './db/queries.service';
import { ReportsService } from './db/reports.service';
import { DocService } from './doc.service';
import { MalloyService } from './malloy.service';
import { ReportTimeColumnsService } from './report-time-columns.service';

let retry = require('async-retry');

@Injectable()
export class ReportDataService {
  constructor(
    private docService: DocService,
    private malloyService: MalloyService,
    private modelsService: ModelsService,
    private reportsService: ReportsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private kitsService: KitsService,
    private reportTimeColumnsService: ReportTimeColumnsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getReportData(item: {
    traceId: string;
    timezone: string;
    timeSpec: TimeSpecEnum;
    timeRangeFractionBrick: string;
    struct: StructTab;
    metrics: ModelMetric[];
    report: ReportTab;
    // queryOperation?: QueryOperation;
    project: ProjectTab;
    envId: string;
    userMemberApi: Member;
    userMember: MemberTab;
    user: UserTab;
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

    // console.log('timeRangeFractionBrick');
    // console.log(timeRangeFractionBrick);

    let {
      columns,
      isTimeColumnsLimitExceeded,
      timeColumnsLimit,
      timeRangeFraction,
      // rangeOpen,
      // rangeClose,
      rangeStart,
      rangeEnd
    } = await this.reportTimeColumnsService.getTimeColumns({
      traceId: traceId,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      projectWeekStart: struct.mproveConfig.weekStart,
      caseSensitiveStringFilters: struct.mproveConfig.caseSensitiveStringFilters
    });

    let metricsStartDateYYYYMMDD = isUndefined(rangeStart)
      ? undefined
      : getYYYYMMDDFromEpochUtcByTimezone({
          timezone: timezone,
          secondsEpochUTC: rangeStart
          // secondsEpochUTC: columns[0].columnId
        });

    let metricsEndDateExcludedYYYYMMDD = isUndefined(rangeEnd)
      ? undefined
      : getYYYYMMDDFromEpochUtcByTimezone({
          timezone: timezone,
          secondsEpochUTC: rangeEnd
        });

    let metricsEndDateIncludedYYYYMMDD = isUndefined(rangeEnd)
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
    //   .filter(x => isDefined(x));

    let modelIds = metrics
      .filter(m => isDefined(m.modelId))
      .map(x => x.modelId);

    let models = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(
          inArray(modelsTable.modelId, modelIds),
          eq(modelsTable.structId, struct.structId)
        )
      })
      .then(xs => xs.map(x => this.modelsService.entToTab(x)));

    report.rows
      .filter(row => isDefined(row.parameters))
      .forEach(row => {
        row.parameters.forEach(rowParameter => {
          if (isDefined(rowParameter.listen)) {
            let reportField = report.fields.find(
              rField => rField.id === rowParameter.listen
            );

            if (isUndefined(reportField)) {
              delete rowParameter.listen;
            } else {
              rowParameter.fractions = reportField.fractions;
            }
          }
        });
      });

    report.rows
      .filter(row => isDefined(row.parameters) && isDefined(row.metricId))
      .forEach(row => {
        let metric: ModelMetric = metrics.find(
          m => m.metricId === row.metricId
        );

        let model = models.find(ml => ml.modelId === metric.modelId);

        if (model.type === ModelTypeEnum.Store) {
          // add required parameters
          model.storeContent.fields
            .filter(x => x.fieldClass === FieldClassEnum.Filter)
            .forEach(storeFilter => {
              if (toBooleanFromLowercaseString(storeFilter.required) === true) {
                let selectedParameter = row.parameters.find(
                  x => x.apply_to === `${storeFilter.name}`
                );

                if (isUndefined(selectedParameter)) {
                  let newFraction: Fraction = {
                    type: FractionTypeEnum.StoreFraction,
                    controls: [] as any[],
                    brick: undefined as any,
                    operator: undefined as any
                  };

                  let newParameter: Parameter = {
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

                  if (isUndefined(selectedControl)) {
                    let newControl: FractionControl = {
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

        let filters: Filter[] = [];

        row.parameters.forEach(rowParameter => {
          let filter: Filter = {
            fieldId: rowParameter.apply_to,
            fractions: rowParameter.fractions
          };

          filters.push(filter);
        });

        row.parametersFiltersWithExcludedTime = filters;
      });

    let newMconfigs: MconfigTab[] = [];
    let newQueries: QueryTab[] = [];

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

      // if (isDefined(rq)) {
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

      if (isDefined(rq)) {
        if (x.rowType === RowTypeEnum.Metric) {
          queryIds.push(rq.queryId);
          mconfigIds.push(rq.mconfigId);
        } else if (x.rowType === RowTypeEnum.Formula) {
          kitIds.push(rq.kitId);
        }
      } else {
        let newMconfig: MconfigTab;
        let newQuery: QueryTab;

        if (x.rowType === RowTypeEnum.Metric) {
          let newMconfigId = makeId();
          let newQueryId = makeId();

          let metric: ModelMetric = metrics.find(
            m => m.metricId === x.metricId
          );

          let model = models.find(ml => ml.modelId === metric.modelId);

          let timeFieldIdSpec;

          if (model.type === ModelTypeEnum.Store) {
            let timeSpecDetail = getTimeSpecDetail({
              timeSpec: timeSpec,
              weekStart: struct.mproveConfig.weekStart
            });

            let storeField = model.storeContent.fields.find(
              field =>
                field.time_group === metric.timeFieldId &&
                field.detail === timeSpecDetail
            );

            timeFieldIdSpec = storeField?.name;
          } else if (model.type === ModelTypeEnum.Malloy) {
            let timeSpecDetail = getTimeSpecDetail({
              timeSpec: timeSpec,
              weekStart: struct.mproveConfig.weekStart
            });

            let mField = model.fields.find(field => {
              let fieldId =
                timeSpecDetail === DetailUnitEnum.Timestamps
                  ? `${metric.timeFieldId}_ts`
                  : [
                        DetailUnitEnum.WeeksSunday,
                        DetailUnitEnum.WeeksMonday
                      ].indexOf(timeSpecDetail) > -1
                    ? `${metric.timeFieldId}_week`
                    : `${metric.timeFieldId}_${timeSpecDetail.slice(0, -1)}`;

              return field.id === fieldId;

              // timeSpecDetail === DetailUnitEnum.Timestamps
              //   ? field.id === `${metric.timeFieldId}_ts`
              //   : field.id === `${metric.timeFieldId}_${field.timeframe}` &&
              //     (([
              //       DetailUnitEnum.WeeksSunday,
              //       DetailUnitEnum.WeeksMonday
              //     ].indexOf(timeSpecDetail) > -1 &&
              //       `${field.timeframe}s` === 'weeks') ||
              //       ([
              //         DetailUnitEnum.WeeksSunday,
              //         DetailUnitEnum.WeeksMonday
              //       ].indexOf(timeSpecDetail) < 0 &&
              //         `${field.timeframe}s` === timeSpecDetail));
            });

            timeFieldIdSpec = mField?.id;
          }

          let isDesc =
            [FractionTypeEnum.TsIsBefore, FractionTypeEnum.TsIsThrough].indexOf(
              timeRangeFraction.type
            ) > -1
              ? true
              : false;

          let timeSorting: Sorting =
            // model.type === ModelTypeEnum.Store &&
            isUndefined(timeFieldIdSpec)
              ? undefined
              : {
                  desc: isDesc,
                  fieldId: timeFieldIdSpec
                };

          let timeFilter: Filter =
            // model.type === ModelTypeEnum.Store &&
            isUndefined(timeFieldIdSpec)
              ? undefined
              : {
                  fieldId: timeFieldIdSpec,
                  fractions: [timeRangeFraction]
                };

          let filters: Filter[] =
            model.type === ModelTypeEnum.Store
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

          let select = isUndefined(timeFieldIdSpec)
            ? []
            : [timeFieldIdSpec, metric.fieldId];

          let sortings = isUndefined(timeFieldIdSpec) ? [] : [timeSorting];

          let sorts = isUndefined(timeFieldIdSpec)
            ? undefined
            : isDesc === true
              ? `${timeFieldIdSpec} desc`
              : `${timeFieldIdSpec}`;

          let mconfig: MconfigTab = {
            structId: struct.structId,
            mconfigId: newMconfigId,
            queryId: newQueryId,
            modelId: model.modelId,
            modelType: model.type,
            dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
            storePart: undefined,
            modelLabel: model.label,
            modelFilePath: model.filePath,
            malloyQueryStable: undefined,
            malloyQueryExtra: undefined,
            compiledQuery: undefined,
            select: model.type === ModelTypeEnum.Malloy ? [] : select,
            // unsafeSelect: [],
            // warnSelect: [],
            // joinAggregations: [],
            sortings: model.type === ModelTypeEnum.Malloy ? [] : sortings,
            sorts: model.type === ModelTypeEnum.Malloy ? undefined : sorts,
            timezone: timezone,
            limit:
              model.type === ModelTypeEnum.Malloy
                ? undefined
                : timeColumnsLimit,
            filters: model.type === ModelTypeEnum.Malloy ? [] : filters,
            chart: makeCopy(DEFAULT_CHART),
            temp: true,
            serverTs: 1
            // fields: [],
            // extendedFilters: [],
          };

          mconfig.chart.type = ChartTypeEnum.Line;

          mconfig = setChartTitleOnSelectChange({
            mconfig: mconfig,
            fields: model.fields
          });

          mconfig = setChartFields({
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

          if (model.type === ModelTypeEnum.Store) {
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
              newQuery.status = QueryStatusEnum.Completed;
              newQuery.data = [];
            }
          } else if (model.type === ModelTypeEnum.Malloy) {
            let editMalloyQueryResult =
              await this.malloyService.editMalloyQuery({
                projectId: project.projectId,
                envId: envId,
                structId: struct.structId,
                model: model,
                mconfig: mconfig,
                queryOperations: [
                  {
                    type: QueryOperationTypeEnum.GroupOrAggregatePlusSort,
                    timezone: timezone,
                    fieldId: select[0],
                    sortFieldId: select[0],
                    desc: isDesc
                  },
                  {
                    type: QueryOperationTypeEnum.GroupOrAggregate,
                    timezone: timezone,
                    fieldId: select[1]
                  },
                  {
                    type: QueryOperationTypeEnum.Limit,
                    timezone: timezone,
                    limit: timeColumnsLimit
                  },
                  {
                    type: QueryOperationTypeEnum.WhereOrHaving,
                    timezone: timezone,
                    // fieldId: filter.fieldId,
                    filters: filters
                  }
                ]
              });

            newMconfig = editMalloyQueryResult.newMconfig;
            newQuery = this.queriesService.apiToTab({
              apiQuery: editMalloyQueryResult.newQuery
            });
            isError = editMalloyQueryResult.isError;

            // console.log('newMconfig');
            // console.log(newMconfig);
            // console.log('newQuery');
            // console.log(newQuery);
            // console.log('isError');
            // console.log(isError);
          }

          newMconfig.queryId = newQueryId;
          newQuery.queryId = newQueryId;

          newMconfigs.push(newMconfig);
          newQueries.push(newQuery);
        }

        let newRq: Rq = {
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

    let mconfigs: MconfigTab[] = [];
    if (mconfigIds.length > 0) {
      mconfigs = await this.db.drizzle.query.mconfigsTable
        .findMany({
          where: and(
            inArray(mconfigsTable.mconfigId, mconfigIds),
            eq(mconfigsTable.structId, struct.structId)
          )
        })
        .then(xs => xs.map(x => this.mconfigsService.entToTab(x)));
    }

    let queries: QueryTab[] = [];
    if (queryIds.length > 0) {
      queries = await this.db.drizzle.query.queriesTable
        .findMany({
          where: and(
            inArray(queriesTable.queryId, queryIds),
            eq(queriesTable.projectId, project.projectId)
          )
        })
        .then(xs => xs.map(x => this.queriesService.entToTab(x)));
    }

    let kits: KitTab[] = [];
    if (kitIds.length > 0) {
      kits = await this.db.drizzle.query.kitsTable
        .findMany({
          where: and(
            inArray(kitsTable.kitId, kitIds),
            eq(kitsTable.structId, report.structId)
          )
        })
        .then(xs => xs.map(x => this.kitsService.entToTab(x)));
    }

    let queriesApi = queries.map(x =>
      this.queriesService.tabToApi({ query: x })
    );

    let mconfigsApi = mconfigs.map(x =>
      this.mconfigsService.tabToApi({
        mconfig: x,
        modelFields: models.find(m => m.modelId === x.modelId).fields
      })
    );

    let modelsApi = models.map(x =>
      this.modelsService.tabToApi({
        model: x,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: x.accessRoles
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

      if (x.rowType === RowTypeEnum.Metric) {
        // let newMconfigsEnts = newMconfigs.map(m =>
        //   this.mconfigsService.wrapToEntityMconfig(m)
        // );

        let newMconfigsApi = newMconfigs.map(y =>
          this.mconfigsService.tabToApi({
            mconfig: y,
            modelFields: modelsApi.find(m => m.modelId === y.modelId).fields
          })
        );

        x.mconfig = [...mconfigsApi, ...newMconfigsApi].find(
          y => y.mconfigId === rq.mconfigId
        );

        let newQueriesApi = newQueries.map(y =>
          this.queriesService.tabToApi({
            query: y
          })
        );

        x.query = [...queriesApi, ...newQueriesApi].find(
          y => y.queryId === rq.queryId
        );
      }
    });

    let reportApi = this.reportsService.tabToApi({
      report: report,
      models: modelsApi,
      member: userMemberApi,
      columns: columns,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      // rangeOpen: rangeOpen,
      // rangeClose: rangeClose,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD: metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD: metricsEndDateIncludedYYYYMMDD,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: columns.length,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded
    });

    let formulaRows = reportApi.rows.filter(
      row => row.rowType === RowTypeEnum.Formula
    );

    let formulaRowsCalculated = formulaRows.filter(row => {
      let rq = row.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      return isDefined(rq) && rq.lastCalculatedTs > 0;
    });

    let queryRows = reportApi.rows.filter(
      row => row.rowType === RowTypeEnum.Metric
    );

    let queryRowsCompleted = queryRows.filter(
      row => row.query.status === QueryStatusEnum.Completed
    );

    let queryRowsCompletedCalculated = queryRowsCompleted.filter(row => {
      let rq = row.rqs.find(
        y =>
          y.fractionBrick === timeRangeFraction.brick &&
          y.timeSpec === timeSpec &&
          y.timezone === timezone
      );

      return isDefined(rq) && rq.lastCalculatedTs > row.query.lastCompleteTs;
    });

    let isCalculateData =
      report.reportId !== EMPTY_REPORT_ID &&
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

        row.records = isDefined(row.query)
          ? reportDataColumns.map(y => {
              let unixTimeZoned = y.fields.timestamp;
              // let unixDateZoned = new Date(unixTimeZoned * 1000);
              // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

              let record: RowRecord = {
                id: y.id,
                columnLabel: undefined,
                key: unixTimeZoned,
                // tsUTC: tsUTC,
                value: isDefined(y.fields) ? y.fields[row.rowId] : undefined,
                error:
                  // isDefined(y.errors)
                  //   ? y.errors[row.rowId]
                  //   :
                  undefined
              };

              return record;
            })
          : isDefined(rq.kitId)
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
                  mconfigs: newMconfigs
                },
                insertOrDoNothing: {
                  queries: newQueries
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
      let dbRows = makeCopy(report.rows);

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
