import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type pgPromise from 'pg-promise';
import type { BackendConfig } from '#backend/config/backend-config';
import { kitsTable } from '#backend/drizzle/postgres/tables/kits';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import type { ReportTab } from '#backend/drizzle/postgres/tables/reports';
import type { StructTab } from '#backend/drizzle/postgres/tables/structs';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { mconfigTabToApi } from '#backend/functions/db/mconfigs/mconfig-tab-to-api/mconfig-tab-to-api';
import {
  type PrepStoreMconfigQueryOutput,
  prepStoreMconfigQuery
} from '#backend/functions/db/mconfigs/prep-store-mconfig-query/prep-store-mconfig-query';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { calculateReportData } from '#backend/functions/db/reports/get-report-data/calculate-report-data/calculate-report-data';
import { getReportTimeColumns } from '#backend/functions/db/reports/get-report-data/get-report-time-columns/get-report-time-columns';
import { reportTabToApi } from '#backend/functions/db/reports/get-report-data/report-tab-to-api/report-tab-to-api';
import { makeReportDataColumns } from '#backend/functions/db/reports/make-report-data-columns/make-report-data-columns';
import { getYYYYMMDDFromEpochUtcByTimezone } from '#backend/functions/get-yyyymmdd-from-epoch-utc-by-timezone/get-yyyymmdd-from-epoch-utc-by-timezone';
import {
  type EditMalloyQueryOutput,
  editMalloyQuery
} from '#backend/functions/malloy/edit-malloy-query/edit-malloy-query';
import type { DbService } from '#backend/services/db/db.service';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { EMPTY_REPORT_ID } from '#common/constants/top';
import { getTimeSpecDetail } from '#common/functions/get-timespec-detail/get-timespec-detail';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import { setChartFields } from '#common/functions/set-chart-fields/set-chart-fields';
import { setChartTitleOnSelectChange } from '#common/functions/set-chart-title-on-select-change/set-chart-title-on-select-change';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string/to-boolean-from-lowercase-string';
import type { CalculateReportDataError } from '#common/types/backend/function-errors/calculate-report-data-error';
import type { DbMconfigsFindManyError } from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-many-error';
import type { DbQueriesFindManyError } from '#common/types/backend/function-errors/db/queries/db-queries-find-many-error';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { GetReportDataError } from '#common/types/backend/function-errors/get-report-data-error';
import type { MakeReportDataColumnsError } from '#common/types/backend/function-errors/make-report-data-columns-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ReportDataColumn } from '#common/types/backend/parts/report/report-data-column';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { DetailUnit } from '#common/types/blockml/parts/field/detail-unit';
import type { Filter } from '#common/types/blockml/parts/filter/filter';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionType } from '#common/types/blockml/parts/fraction/fraction-type';
import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { ModelMetric } from '#common/types/blockml/parts/model/model-metric';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Sorting } from '#common/types/blockml/parts/query/sorting';
import type { ReportField } from '#common/types/blockml/parts/report/report-field';
import type { Parameter } from '#common/types/blockml/parts/report/row/parameter';
import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { RowRecord } from '#common/types/blockml/parts/report/row/row-record';
import type { Rq } from '#common/types/blockml/parts/report/row/rq';
import type { TimeSpec } from '#common/types/shared/time/timespec';

type PrepareReportCalculationPayload = {
  queriesApi: Query[];
  mconfigsApi: MconfigX[];
  modelsApi: ModelX[];
  reportApi: ReportX;
  formulaRows: Row[];
  formulaRowsCalculated: Row[];
  queryRows: Row[];
  queryRowsCompleted: Row[];
  queryRowsCompletedCalculated: Row[];
  isCalculateData: boolean;
};

type PrepareReportQueriesPayload = {
  newMconfigs: MconfigTab[];
  newQueries: QueryTab[];
  mconfigIds: string[];
  queryIds: string[];
  kitIds: string[];
};

type PrepareMetricRangePayload = {
  metricsStartDateYYYYMMDD: string;
  metricsEndDateExcludedYYYYMMDD: string;
  metricsEndDateIncludedYYYYMMDD: string;
  modelIds: string[];
};

export async function getReportData(item: {
  traceId: string;
  timezone: string;
  timeSpec: TimeSpec;
  timeRangeFractionBrick: string;
  struct: StructTab;
  metrics: ModelMetric[];
  report: ReportTab;
  project: ProjectTab;
  envId: string;
  apiUserMember: Member;
  userMember: MemberTab;
  user: UserTab;
  isSaveToDb?: boolean;
  db: DbService;
  calcDb: pgPromise.IDatabase<unknown>;
  logger: Logger;
  cs: ConfigService<BackendConfig>;
}): Result.ResultAsync<ReportX, GetReportDataError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('getReportTimeColumnsOutput', v =>
      getReportTimeColumns({
        traceId: v.traceId,
        timezone: v.timezone,
        timeSpec: v.timeSpec,
        timeRangeFractionBrick: v.timeRangeFractionBrick,
        projectWeekStart: v.struct.mproveConfig.weekStart,
        caseSensitiveStringFilters:
          v.struct.mproveConfig.caseSensitiveStringFilters
      })
    ),
    Result.bind('prepareMetricRangePayload', v => {
      let metricsStartDateYYYYMMDD: string = isUndefined(
        v.getReportTimeColumnsOutput.rangeStart
      )
        ? undefined
        : getYYYYMMDDFromEpochUtcByTimezone({
            timezone: v.timezone,
            secondsEpochUTC: v.getReportTimeColumnsOutput.rangeStart
          });

      let metricsEndDateExcludedYYYYMMDD: string = isUndefined(
        v.getReportTimeColumnsOutput.rangeEnd
      )
        ? undefined
        : getYYYYMMDDFromEpochUtcByTimezone({
            timezone: v.timezone,
            secondsEpochUTC: v.getReportTimeColumnsOutput.rangeEnd
          });

      let metricsEndDateIncludedYYYYMMDD: string = isUndefined(
        v.getReportTimeColumnsOutput.rangeEnd
      )
        ? undefined
        : getYYYYMMDDFromEpochUtcByTimezone({
            timezone: v.timezone,
            secondsEpochUTC:
              v.getReportTimeColumnsOutput.rangeEnd -
                v.getReportTimeColumnsOutput.rangeStart >=
              24 * 60 * 60
                ? v.getReportTimeColumnsOutput.rangeEnd - 24 * 60 * 60
                : v.getReportTimeColumnsOutput.rangeEnd
          });

      let modelIds: string[] = v.metrics
        .filter(m => isDefined(m.modelId))
        .map(x => x.modelId);

      let prepareMetricRangePayload: PrepareMetricRangePayload = {
        metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
        metricsEndDateExcludedYYYYMMDD: metricsEndDateExcludedYYYYMMDD,
        metricsEndDateIncludedYYYYMMDD: metricsEndDateIncludedYYYYMMDD,
        modelIds: modelIds
      };

      return Result.succeed(prepareMetricRangePayload);
    }),
    Result.bind('models', v =>
      v.db.models.findMany({
        where: and(
          inArray(modelsTable.modelId, v.prepareMetricRangePayload.modelIds),
          eq(modelsTable.structId, v.struct.structId)
        )
      })
    ),
    Result.bind('prepareReportQueriesPayload', v => {
      v.report.rows
        .filter(row => isDefined(row.parameters))
        .forEach(row => {
          row.parameters.forEach(rowParameter => {
            if (isDefined(rowParameter.listen)) {
              let reportField: ReportField = v.report.fields.find(
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

      v.report.rows
        .filter(row => isDefined(row.parameters) && isDefined(row.metricId))
        .forEach(row => {
          let metric: ModelMetric = v.metrics.find(
            m => m.metricId === row.metricId
          );

          let model: ModelTab = v.models.find(
            ml => ml.modelId === metric.modelId
          );

          if (model.type === 'Store') {
            model.storeContent.fields
              .filter(x => x.fieldClass === 'filter')
              .forEach(storeFilter => {
                if (
                  toBooleanFromLowercaseString(storeFilter.required) === true
                ) {
                  let selectedParameter: Parameter = row.parameters.find(
                    x => x.apply_to === `${storeFilter.name}`
                  );

                  if (isUndefined(selectedParameter)) {
                    let newFraction: Fraction = {
                      type: 'StoreFraction',
                      controls: [] as any[],
                      brick: undefined as any,
                      parentBrick: undefined as any,
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

                  storeFilter.fraction_controls.forEach(
                    storeFractionControl => {
                      let selectedControl: FractionControl =
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

                        selectedParameter.fractions[0].controls.push(
                          newControl
                        );
                      }
                    }
                  );
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

      let prepareReportQueriesPayload: PrepareReportQueriesPayload = {
        newMconfigs: newMconfigs,
        newQueries: newQueries,
        mconfigIds: mconfigIds,
        queryIds: queryIds,
        kitIds: kitIds
      };

      return Result.succeed(prepareReportQueriesPayload);
    }),
    Result.andThrough(async v => {
      let reportQueryPreparationResult: Result.Result<
        void[],
        PrepStoreMconfigQueryError | EditMalloyQueryError
      > = await Result.sequence(
        v.report.rows,
        async (
          x
        ): Result.ResultAsync<
          void,
          PrepStoreMconfigQueryError | EditMalloyQueryError
        > => {
          let rq: Rq = x.rqs.find(
            y =>
              y.fractionBrick ===
                v.getReportTimeColumnsOutput.timeRangeFraction.brick &&
              y.timeSpec === v.timeSpec &&
              y.timezone === v.timezone
          );

          if (isDefined(rq)) {
            if (x.rowType === 'metric') {
              v.prepareReportQueriesPayload.queryIds.push(rq.queryId);

              v.prepareReportQueriesPayload.mconfigIds.push(rq.mconfigId);
            } else if (x.rowType === 'formula') {
              v.prepareReportQueriesPayload.kitIds.push(rq.kitId);
            }
          } else {
            let newMconfig: MconfigTab;

            let newQuery: QueryTab;

            if (x.rowType === 'metric') {
              let newMconfigId: string = makeId();

              let newQueryId: string = makeId();

              let metric: ModelMetric = v.metrics.find(
                m => m.metricId === x.metricId
              );

              let model: ModelTab = v.models.find(
                ml => ml.modelId === metric.modelId
              );

              let timeFieldIdSpec: any;

              if (model.type === 'Store') {
                let timeSpecDetail:
                  | 'timestamps'
                  | 'minutes'
                  | 'hours'
                  | 'days'
                  | 'months'
                  | 'quarters'
                  | 'years'
                  | 'weeksSunday'
                  | 'weeksMonday' = getTimeSpecDetail({
                  timeSpec: v.timeSpec,
                  weekStart: v.struct.mproveConfig.weekStart
                });

                let storeField: FieldAny = model.storeContent.fields.find(
                  field =>
                    field.time_group === metric.timeFieldId &&
                    field.detail === timeSpecDetail
                );

                timeFieldIdSpec = storeField?.name;
              } else if (model.type === 'Malloy') {
                let timeSpecDetail:
                  | 'timestamps'
                  | 'minutes'
                  | 'hours'
                  | 'days'
                  | 'months'
                  | 'quarters'
                  | 'years'
                  | 'weeksSunday'
                  | 'weeksMonday' = getTimeSpecDetail({
                  timeSpec: v.timeSpec,
                  weekStart: v.struct.mproveConfig.weekStart
                });

                let mField: ModelField = model.fields.find(field => {
                  let fieldId =
                    timeSpecDetail === 'timestamps'
                      ? `${metric.timeFieldId}_ts`
                      : (
                            [
                              'weeksSunday',
                              'weeksMonday'
                            ] satisfies DetailUnit[]
                          ).findIndex(
                            candidate => candidate === timeSpecDetail
                          ) > -1
                        ? `${metric.timeFieldId}_week`
                        : `${metric.timeFieldId}_${timeSpecDetail.slice(0, -1)}`;

                  return field.id === fieldId;
                });

                timeFieldIdSpec = mField?.id;
              }

              let isDesc: boolean =
                (
                  ['TsIsBefore', 'TsIsThrough'] satisfies FractionType[]
                ).findIndex(
                  candidate =>
                    candidate ===
                    v.getReportTimeColumnsOutput.timeRangeFraction.type
                ) > -1
                  ? true
                  : false;

              let timeSorting: Sorting = isUndefined(timeFieldIdSpec)
                ? undefined
                : {
                    desc: isDesc,
                    fieldId: timeFieldIdSpec
                  };

              let timeFilter: Filter = isUndefined(timeFieldIdSpec)
                ? undefined
                : {
                    fieldId: timeFieldIdSpec,
                    fractions: [v.getReportTimeColumnsOutput.timeRangeFraction]
                  };

              let filters: Filter[] =
                model.type === 'Store'
                  ? [...x.parametersFiltersWithExcludedTime].sort((a, b) =>
                      a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
                    )
                  : [timeFilter, ...x.parametersFiltersWithExcludedTime].sort(
                      (a, b) =>
                        a.fieldId > b.fieldId
                          ? 1
                          : b.fieldId > a.fieldId
                            ? -1
                            : 0
                    );

              let select: string[] = isUndefined(timeFieldIdSpec)
                ? []
                : [timeFieldIdSpec, metric.fieldId];

              let sortings: Sorting[] = isUndefined(timeFieldIdSpec)
                ? []
                : [timeSorting];

              let sorts: string = isUndefined(timeFieldIdSpec)
                ? undefined
                : isDesc === true
                  ? `${timeFieldIdSpec} desc`
                  : `${timeFieldIdSpec}`;

              let mconfig: MconfigTab = {
                structId: v.struct.structId,
                mconfigId: newMconfigId,
                queryId: newQueryId,
                modelId: model.modelId,
                modelType: model.type,
                parentType: 'Report',
                parentId: v.report.reportId,
                dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
                storePart: undefined,
                modelLabel: model.label,
                modelFilePath: model.filePath,
                malloyQueryStable: undefined,
                malloyQueryExtra: undefined,
                compiledQuery: undefined,
                select: model.type === 'Malloy' ? [] : select,
                sortings: model.type === 'Malloy' ? [] : sortings,
                sorts: model.type === 'Malloy' ? undefined : sorts,
                timezone: v.timezone,
                limit:
                  model.type === 'Malloy'
                    ? undefined
                    : v.getReportTimeColumnsOutput.timeColumnsLimit,
                filters: model.type === 'Malloy' ? [] : filters,
                chart: makeCopy(DEFAULT_CHART),
                sessionId: undefined,
                keyTag: undefined,
                serverTs: 1
              };

              mconfig.chart.type = 'line';

              mconfig = setChartTitleOnSelectChange({
                mconfig: mconfig,
                fields: model.fields
              });

              mconfig = setChartFields({
                mconfig: mconfig,
                fields: model.fields
              });

              let isError: boolean = false;

              if (model.type === 'Store') {
                let prepStoreMconfigQueryOutput: Result.Result<
                  PrepStoreMconfigQueryOutput,
                  PrepStoreMconfigQueryError
                > = await prepStoreMconfigQuery({
                  struct: v.struct,
                  project: v.project,
                  envId: v.envId,
                  model: model,
                  mconfig: mconfig,
                  mconfigParentType: 'Report',
                  mconfigParentId: v.report.reportId,
                  metricsStartDateYYYYMMDD:
                    v.prepareMetricRangePayload.metricsStartDateYYYYMMDD,
                  metricsEndDateYYYYMMDD:
                    mconfig.dateRangeIncludesRightSide === true
                      ? v.prepareMetricRangePayload
                          .metricsEndDateIncludedYYYYMMDD
                      : v.prepareMetricRangePayload
                          .metricsEndDateExcludedYYYYMMDD,
                  db: v.db
                });

                if (Result.isFailure(prepStoreMconfigQueryOutput)) {
                  return prepStoreMconfigQueryOutput;
                }

                let mqe: {
                  isError: boolean;
                  newMconfig: MconfigTab;
                  newQuery: QueryTab;
                } = prepStoreMconfigQueryOutput.value;

                newMconfig = mqe.newMconfig;

                newQuery = mqe.newQuery;

                isError = mqe.isError;

                if (newMconfig.select.length === 0) {
                  newQuery.status = 'Completed';

                  newQuery.data = [];
                }
              } else if (model.type === 'Malloy') {
                let editMalloyQueryOutput: Result.Result<
                  EditMalloyQueryOutput,
                  EditMalloyQueryError
                > = await editMalloyQuery({
                  projectId: v.project.projectId,
                  envId: v.envId,
                  structId: v.struct.structId,
                  mconfigParentType: 'Report',
                  mconfigParentId: v.report.reportId,
                  user: v.user,
                  model: model,
                  mconfig: mconfig,
                  queryOperations: [
                    {
                      type: 'GroupOrAggregatePlusSort',
                      timezone: v.timezone,
                      fieldId: select[0],
                      sortFieldId: select[0],
                      desc: isDesc
                    },
                    {
                      type: 'GroupOrAggregate',
                      timezone: v.timezone,
                      fieldId: select[1]
                    },
                    {
                      type: 'Limit',
                      timezone: v.timezone,
                      limit: v.getReportTimeColumnsOutput.timeColumnsLimit
                    },
                    {
                      type: 'WhereOrHaving',
                      timezone: v.timezone,
                      filters: filters
                    }
                  ],
                  db: v.db,
                  logger: v.logger,
                  cs: v.cs
                });

                if (Result.isFailure(editMalloyQueryOutput)) {
                  return editMalloyQueryOutput;
                }

                let editMalloyQueryResult: {
                  isError: boolean;
                  newMconfig: MconfigTab;
                  newQuery: QueryTab;
                } = editMalloyQueryOutput.value;

                newMconfig = editMalloyQueryResult.newMconfig;

                newQuery = editMalloyQueryResult.newQuery;

                isError = editMalloyQueryResult.isError;
              }

              newMconfig.queryId = newQueryId;

              newQuery.queryId = newQueryId;

              newQuery.reportId = v.report.reportId;

              newQuery.reportStructId = v.report.structId;

              v.prepareReportQueriesPayload.newMconfigs.push(newMconfig);

              v.prepareReportQueriesPayload.newQueries.push(newQuery);
            }

            let newRq: Rq = {
              fractionBrick:
                v.getReportTimeColumnsOutput.timeRangeFraction.brick,
              timeSpec: v.timeSpec,
              timezone: v.timezone,
              timeStartTs: v.getReportTimeColumnsOutput.columns[0].columnId,
              timeEndTs:
                v.getReportTimeColumnsOutput.columns[
                  v.getReportTimeColumnsOutput.columns.length - 1
                ].columnId,
              mconfigId: newMconfig?.mconfigId,
              queryId: newMconfig?.queryId,
              kitId: undefined,
              lastCalculatedTs: 0
            };

            x.rqs.push(newRq);
          }

          return Result.succeed();
        }
      );

      if (Result.isFailure(reportQueryPreparationResult)) {
        return reportQueryPreparationResult;
      }

      return Result.succeed();
    }),
    Result.bind('mconfigs', v => Result.succeed<MconfigTab[]>([])),
    Result.andThrough(async v => {
      if (v.prepareReportQueriesPayload.mconfigIds.length > 0) {
        let mconfigResult: Result.Result<
          MconfigTab[],
          DbMconfigsFindManyError
        > = await v.db.mconfigs.findMany({
          where: and(
            inArray(
              mconfigsTable.mconfigId,
              v.prepareReportQueriesPayload.mconfigIds
            ),
            eq(mconfigsTable.structId, v.struct.structId)
          )
        });

        if (Result.isFailure(mconfigResult)) {
          return mconfigResult;
        }

        v.mconfigs = mconfigResult.value;
      }

      return Result.succeed();
    }),
    Result.bind('queries', v => Result.succeed<QueryTab[]>([])),
    Result.andThrough(async v => {
      if (v.prepareReportQueriesPayload.queryIds.length > 0) {
        let queryResult: Result.Result<QueryTab[], DbQueriesFindManyError> =
          await v.db.queries.findMany({
            where: and(
              inArray(
                queriesTable.queryId,
                v.prepareReportQueriesPayload.queryIds
              ),
              eq(queriesTable.projectId, v.project.projectId)
            )
          });

        if (Result.isFailure(queryResult)) {
          return queryResult;
        }

        v.queries = queryResult.value;
      }

      return Result.succeed();
    }),
    Result.bind('kits', async v =>
      v.prepareReportQueriesPayload.kitIds.length === 0
        ? Result.succeed([])
        : v.db.kits.findMany({
            where: and(
              inArray(kitsTable.kitId, v.prepareReportQueriesPayload.kitIds),
              eq(kitsTable.structId, v.report.structId)
            )
          })
    ),
    Result.bind('prepareReportCalculationPayload', v => {
      let queriesApi: Query[] = v.queries.map(x =>
        queryTabToApi({
          query: x
        })
      );

      let mconfigsApi: MconfigX[] = v.mconfigs.map(x =>
        mconfigTabToApi({
          mconfig: x,
          modelFields: v.models.find(m => m.modelId === x.modelId).fields
        })
      );

      let modelsApi: ModelX[] = v.models.map(x =>
        modelTabToApi({
          model: x,
          hasAccess: checkModelAccess({
            member: v.userMember,
            modelAccessRoles: x.accessRolesCombined
          })
        })
      );

      v.report.rows.forEach(x => {
        let rq: Rq = x.rqs.find(
          y =>
            y.fractionBrick ===
              v.getReportTimeColumnsOutput.timeRangeFraction.brick &&
            y.timeSpec === v.timeSpec &&
            y.timezone === v.timezone
        );

        if (x.rowType === 'metric') {
          let newMconfigsApi: MconfigX[] =
            v.prepareReportQueriesPayload.newMconfigs.map(y =>
              mconfigTabToApi({
                mconfig: y,
                modelFields: modelsApi.find(m => m.modelId === y.modelId).fields
              })
            );

          x.mconfig = [...mconfigsApi, ...newMconfigsApi].find(
            y => y.mconfigId === rq.mconfigId
          );

          let newQueriesApi: Query[] =
            v.prepareReportQueriesPayload.newQueries.map(y =>
              queryTabToApi({
                query: y
              })
            );

          x.query = [...queriesApi, ...newQueriesApi].find(
            y => y.queryId === rq.queryId
          );
        }
      });

      let reportApi: ReportX = reportTabToApi({
        report: v.report,
        models: modelsApi,
        member: v.apiUserMember,
        columns: v.getReportTimeColumnsOutput.columns,
        timezone: v.timezone,
        timeSpec: v.timeSpec,
        timeRangeFraction: v.getReportTimeColumnsOutput.timeRangeFraction,
        rangeStart: v.getReportTimeColumnsOutput.rangeStart,
        rangeEnd: v.getReportTimeColumnsOutput.rangeEnd,
        metricsStartDateYYYYMMDD:
          v.prepareMetricRangePayload.metricsStartDateYYYYMMDD,
        metricsEndDateExcludedYYYYMMDD:
          v.prepareMetricRangePayload.metricsEndDateExcludedYYYYMMDD,
        metricsEndDateIncludedYYYYMMDD:
          v.prepareMetricRangePayload.metricsEndDateIncludedYYYYMMDD,
        timeColumnsLimit: v.getReportTimeColumnsOutput.timeColumnsLimit,
        timeColumnsLength: v.getReportTimeColumnsOutput.columns.length,
        isTimeColumnsLimitExceeded:
          v.getReportTimeColumnsOutput.isTimeColumnsLimitExceeded
      });

      let formulaRows: Row[] = reportApi.rows.filter(
        row => row.rowType === 'formula'
      );

      let formulaRowsCalculated: Row[] = formulaRows.filter(row => {
        let rq: Rq = row.rqs.find(
          y =>
            y.fractionBrick ===
              v.getReportTimeColumnsOutput.timeRangeFraction.brick &&
            y.timeSpec === v.timeSpec &&
            y.timezone === v.timezone
        );

        return isDefined(rq) && rq.lastCalculatedTs > 0;
      });

      let queryRows: Row[] = reportApi.rows.filter(
        row => row.rowType === 'metric'
      );

      let queryRowsCompleted: Row[] = queryRows.filter(
        row => row.query.status === 'Completed'
      );

      let queryRowsCompletedCalculated: Row[] = queryRowsCompleted.filter(
        row => {
          let rq: Rq = row.rqs.find(
            y =>
              y.fractionBrick ===
                v.getReportTimeColumnsOutput.timeRangeFraction.brick &&
              y.timeSpec === v.timeSpec &&
              y.timezone === v.timezone
          );

          return (
            isDefined(rq) && rq.lastCalculatedTs > row.query.lastCompleteTs
          );
        }
      );

      let isCalculateData: boolean =
        v.report.reportId !== EMPTY_REPORT_ID &&
        queryRows.length === queryRowsCompleted.length &&
        (queryRowsCompleted.length !== queryRowsCompletedCalculated.length ||
          formulaRows.length !== formulaRowsCalculated.length);

      let prepareReportCalculationPayload: PrepareReportCalculationPayload = {
        queriesApi: queriesApi,
        mconfigsApi: mconfigsApi,
        modelsApi: modelsApi,
        reportApi: reportApi,
        formulaRows: formulaRows,
        formulaRowsCalculated: formulaRowsCalculated,
        queryRows: queryRows,
        queryRowsCompleted: queryRowsCompleted,
        queryRowsCompletedCalculated: queryRowsCompletedCalculated,
        isCalculateData: isCalculateData
      };

      return Result.succeed(prepareReportCalculationPayload);
    }),
    Result.andThrough(async v => {
      if (v.prepareReportCalculationPayload.isCalculateData === true) {
        let calculatedReportResult: Result.Result<
          ReportX,
          CalculateReportDataError
        > = await calculateReportData({
          report: v.prepareReportCalculationPayload.reportApi,
          timezone: v.timezone,
          timeSpec: v.timeSpec,
          timeRangeFraction: v.getReportTimeColumnsOutput.timeRangeFraction,
          db: v.db,
          calcDb: v.calcDb
        });

        if (Result.isFailure(calculatedReportResult)) {
          return calculatedReportResult;
        }

        v.prepareReportCalculationPayload.reportApi =
          calculatedReportResult.value;
      } else {
        let reportDataColumnsResult: Result.Result<
          ReportDataColumn[],
          MakeReportDataColumnsError
        > = makeReportDataColumns({
          report: v.prepareReportCalculationPayload.reportApi,
          timeSpec: v.timeSpec
        });

        if (Result.isFailure(reportDataColumnsResult)) {
          return reportDataColumnsResult;
        }

        let reportDataColumns: ReportDataColumn[] =
          reportDataColumnsResult.value;

        v.prepareReportCalculationPayload.reportApi.rows.forEach(row => {
          let rq: Rq = row.rqs.find(
            y =>
              y.fractionBrick ===
                v.getReportTimeColumnsOutput.timeRangeFraction.brick &&
              y.timeSpec === v.timeSpec &&
              y.timezone === v.timezone
          );

          row.records = isDefined(row.query)
            ? reportDataColumns.map(y => {
                let unixTimeZoned = y.fields.timestamp;

                let record: RowRecord = {
                  id: y.id,
                  columnLabel: undefined,
                  key: unixTimeZoned,
                  value: isDefined(y.fields) ? y.fields[row.rowId] : undefined,
                  error: undefined
                };

                return record;
              })
            : isDefined(rq.kitId)
              ? (v.kits.find(k => k.kitId === rq.kitId)?.data as any[]) || []
              : [];
        });
      }

      return Result.succeed();
    }),
    Result.andThrough(async v => {
      if (
        v.prepareReportQueriesPayload.newMconfigs.length > 0 ||
        v.prepareReportQueriesPayload.newQueries.length > 0
      ) {
        let persistenceResult: Result.Result<void, WriteError> =
          await v.db.write({
            insert: {
              mconfigs: v.prepareReportQueriesPayload.newMconfigs
            },
            insertOrDoNothing: {
              queries: v.prepareReportQueriesPayload.newQueries
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }
      }

      return Result.succeed();
    }),
    Result.andThrough(async v => {
      if (
        v.isSaveToDb === true ||
        v.prepareReportCalculationPayload.isCalculateData === true ||
        v.prepareReportQueriesPayload.newMconfigs.length > 0 ||
        v.prepareReportQueriesPayload.newQueries.length > 0
      ) {
        let dbRows: Row[] = makeCopy(v.report.rows);

        dbRows.forEach(x => {
          delete x.mconfig;

          delete x.query;
        });

        v.report.rows = dbRows;

        let persistenceResult: Result.Result<void, WriteError> =
          await v.db.write({
            insertOrUpdate: {
              reports: [v.report]
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }
      }

      return Result.succeed();
    }),
    Result.map((v): ReportX => v.prepareReportCalculationPayload.reportApi)
  );
}
