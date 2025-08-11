import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInQuarters,
  differenceInWeeks,
  differenceInYears,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  fromUnixTime,
  getUnixTime,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  sub
} from 'date-fns';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { nodeCommon } from '~backend/barrels/node-common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { processRowIds } from '~backend/functions/process-row-ids';
import { ProjectConnection } from '~common/_index';
import { EnvsService } from './envs.service';
import { RabbitService } from './rabbit.service';
import { WrapToEntService } from './wrap-to-ent.service';

let retry = require('async-retry');

@Injectable()
export class BlockmlService {
  constructor(
    private rabbitService: RabbitService,
    private envsService: EnvsService,
    private wrapToEntService: WrapToEntService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async rebuildStruct(item: {
    traceId: string;
    projectId: string;
    structId: string;
    envId: string;
    diskFiles: common.DiskCatalogFile[];
    mproveDir: string;
    skipDb?: boolean;
    connections?: common.ProjectConnection[];
    evs?: common.Ev[];
    overrideTimezone: string;
  }) {
    let {
      traceId,
      structId,
      projectId,
      envId,
      diskFiles,
      mproveDir,
      skipDb,
      connections,
      evs,
      overrideTimezone
    } = item;

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let apiEnv = apiEnvs.find(x => x.envId === envId);

    let connectionsWithFallback: ProjectConnection[] = [];

    if (
      common.isUndefined(connections) &&
      apiEnv?.envConnectionIdsWithFallback.length > 0
    ) {
      let connectionsEnts =
        await this.db.drizzle.query.connectionsTable.findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            inArray(
              connectionsTable.connectionId,
              apiEnv.envConnectionIdsWithFallback
            )
          )
        });

      connectionsWithFallback = connectionsEnts.map(
        x =>
          <common.ProjectConnection>{
            connectionId: x.connectionId,
            type: x.type,
            googleCloudProject: x.googleCloudProject,
            host: x.host,
            port: x.port,
            username: x.username,
            password: x.password,
            databaseName: x.database
          }
      );
    }

    let toBlockmlRebuildStructRequest: apiToBlockml.ToBlockmlRebuildStructRequest =
      {
        info: {
          name: apiToBlockml.ToBlockmlRequestInfoNameEnum
            .ToBlockmlRebuildStruct,
          traceId: traceId
        },
        payload: {
          structId: structId,
          projectId: projectId,
          mproveDir: mproveDir,
          files: helper.diskFilesToBlockmlFiles(diskFiles),
          envId: envId,
          evs: common.isDefined(evs) ? evs : apiEnv.evsWithFallback,
          connections: common.isDefined(connections)
            ? connections
            : connectionsWithFallback,
          overrideTimezone: overrideTimezone
        }
      };

    let blockmlRebuildStructResponse =
      await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlRebuildStructResponse>(
        {
          routingKey: common.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
          message: toBlockmlRebuildStructRequest,
          checkIsOk: true
        }
      );

    let rs = blockmlRebuildStructResponse.payload;

    let struct: schemaPostgres.StructEnt = {
      projectId: projectId,
      structId: structId,
      mproveDirValue: rs.mproveDirValue,
      weekStart: rs.weekStart,
      allowTimezones: rs.allowTimezones,
      caseSensitiveStringFilters: rs.caseSensitiveStringFilters,
      simplifySafeAggregates: rs.simplifySafeAggregates,
      defaultTimezone: rs.defaultTimezone,
      formatNumber: rs.formatNumber,
      currencyPrefix: rs.currencyPrefix,
      currencySuffix: rs.currencySuffix,
      thousandsSeparator: rs.thousandsSeparator,
      errors: rs.errors,
      views: rs.views,
      metrics: rs.metrics,
      presets: rs.presets,
      udfsDict: rs.udfsDict,
      serverTs: undefined
    };

    rs.reports.forEach(report => {
      let newRows = processRowIds({
        rows: report.rows,
        targetRowIds: report.rows.map(r => r.rowId)
      });

      report.rows = newRows;
    });

    if (common.isUndefined(skipDb) || skipDb === false) {
      await retry(
        async () => {
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insert: {
                  structs: [struct],
                  charts: rs.charts.map(x =>
                    this.wrapToEntService.wrapToEntityChart({
                      chart: x,
                      chartType: rs.mconfigs.find(
                        mconfig => mconfig.mconfigId === x.tiles[0].mconfigId
                      ).chart.type
                    })
                  ),
                  models: rs.models.map(x =>
                    this.wrapToEntService.wrapToEntityModel(x)
                  ),
                  reports: rs.reports.map(x =>
                    this.wrapToEntService.wrapToEntityReport(x)
                  ),
                  mconfigs: rs.mconfigs.map(x =>
                    this.wrapToEntService.wrapToEntityMconfig(x)
                  ),
                  dashboards: rs.dashboards.map(x =>
                    this.wrapToEntService.wrapToEntityDashboard(x)
                  )
                },
                insertOrDoNothing: {
                  queries: rs.queries.map(x =>
                    this.wrapToEntService.wrapToEntityQuery(x)
                  )
                }
              })
          );
        },
        getRetryOption(this.cs, this.logger)
      );
    }

    return {
      struct: struct,
      models: rs.models,
      reports: rs.reports,
      dashboards: rs.dashboards,
      charts: rs.charts,
      metrics: rs.metrics,
      mconfigs: rs.mconfigs,
      queries: rs.queries
    };
  }

  async getTimeColumns(item: {
    traceId: string;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFractionBrick: string;
    projectWeekStart: common.ProjectWeekStartEnum;
    caseSensitiveStringFilters: boolean;
  }) {
    let {
      traceId,
      timezone,
      timeSpec,
      timeRangeFractionBrick,
      projectWeekStart,
      caseSensitiveStringFilters
    } = item;

    let timeColumnsLimit = common.TIME_COLUMNS_LIMIT;

    let toBlockmlGetTimeRangeRequest: apiToBlockml.ToBlockmlGetTimeRangeRequest =
      {
        info: {
          name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlGetTimeRange,
          traceId: traceId
        },
        payload: {
          timeRangeFractionBrick: timeRangeFractionBrick,
          timeSpec: timeSpec,
          timezone: timezone,
          weekStart: projectWeekStart,
          caseSensitiveStringFilters: caseSensitiveStringFilters
        }
      };

    let blockmlGetTimeRangeResponse =
      await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlGetTimeRangeResponse>(
        {
          routingKey: common.RabbitBlockmlRoutingEnum.GetTimeRange.toString(),
          message: toBlockmlGetTimeRangeRequest,
          checkIsOk: true
        }
      );

    if (blockmlGetTimeRangeResponse.payload.isValid === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_WRONG_TIME_RANGE
      });
    }

    let timeRangeFraction =
      blockmlGetTimeRangeResponse.payload.timeRangeFraction;

    let respRangeStart = blockmlGetTimeRangeResponse.payload.rangeStart;
    let respRangeEnd = blockmlGetTimeRangeResponse.payload.rangeEnd;

    let rangeStart =
      common.isUndefined(respRangeStart) && common.isUndefined(respRangeEnd)
        ? undefined
        : common.isDefined(respRangeStart)
          ? respRangeStart
          : timeSpec === common.TimeSpecEnum.Timestamps
            ? undefined
            : getUnixTime(
                sub(
                  fromUnixTime(respRangeEnd),
                  timeSpec === common.TimeSpecEnum.Years
                    ? { years: timeColumnsLimit }
                    : timeSpec === common.TimeSpecEnum.Quarters
                      ? { months: timeColumnsLimit * 3 }
                      : timeSpec === common.TimeSpecEnum.Months
                        ? { months: timeColumnsLimit }
                        : timeSpec === common.TimeSpecEnum.Weeks
                          ? { days: timeColumnsLimit * 7 }
                          : timeSpec === common.TimeSpecEnum.Days
                            ? { days: timeColumnsLimit }
                            : timeSpec === common.TimeSpecEnum.Hours
                              ? { hours: timeColumnsLimit }
                              : timeSpec === common.TimeSpecEnum.Minutes
                                ? { minutes: timeColumnsLimit }
                                : {}
                )
              );

    let rangeEnd =
      common.isUndefined(respRangeStart) && common.isUndefined(respRangeEnd)
        ? undefined
        : common.isDefined(respRangeEnd)
          ? respRangeEnd
          : timeSpec === common.TimeSpecEnum.Timestamps
            ? undefined
            : getUnixTime(
                add(
                  fromUnixTime(respRangeStart),
                  timeSpec === common.TimeSpecEnum.Years
                    ? { years: timeColumnsLimit }
                    : timeSpec === common.TimeSpecEnum.Quarters
                      ? { months: timeColumnsLimit * 3 }
                      : timeSpec === common.TimeSpecEnum.Months
                        ? { months: timeColumnsLimit }
                        : timeSpec === common.TimeSpecEnum.Weeks
                          ? { days: timeColumnsLimit * 7 }
                          : timeSpec === common.TimeSpecEnum.Days
                            ? { days: timeColumnsLimit }
                            : timeSpec === common.TimeSpecEnum.Hours
                              ? { hours: timeColumnsLimit }
                              : timeSpec === common.TimeSpecEnum.Minutes
                                ? { minutes: timeColumnsLimit }
                                : {}
                )
              );

    let startDate = common.isDefined(rangeStart)
      ? new Date(rangeStart * 1000)
      : undefined;

    let endDate = common.isDefined(rangeEnd)
      ? new Date(rangeEnd * 1000)
      : undefined;

    let diffColumnsLength =
      timeSpec === common.TimeSpecEnum.Timestamps
        ? 0
        : timeSpec === common.TimeSpecEnum.Years
          ? differenceInYears(endDate, startDate)
          : timeSpec === common.TimeSpecEnum.Quarters
            ? differenceInQuarters(endDate, startDate)
            : timeSpec === common.TimeSpecEnum.Months
              ? differenceInMonths(endDate, startDate)
              : timeSpec === common.TimeSpecEnum.Weeks
                ? differenceInWeeks(endDate, startDate)
                : timeSpec === common.TimeSpecEnum.Days
                  ? differenceInDays(endDate, startDate)
                  : timeSpec === common.TimeSpecEnum.Hours
                    ? differenceInHours(endDate, startDate)
                    : timeSpec === common.TimeSpecEnum.Minutes
                      ? differenceInMinutes(endDate, startDate)
                      : undefined;

    let isTimeColumnsLimitExceeded = false;

    if (diffColumnsLength > timeColumnsLimit) {
      isTimeColumnsLimitExceeded = true;

      if (
        [
          common.FractionTypeEnum.TsIsBefore, // maybe no such case
          common.FractionTypeEnum.TsIsThrough // maybe no such case
        ].indexOf(timeRangeFraction.type) > -1
      ) {
        startDate = sub(
          endDate,
          timeSpec === common.TimeSpecEnum.Years
            ? { years: timeColumnsLimit }
            : timeSpec === common.TimeSpecEnum.Quarters
              ? { months: timeColumnsLimit * 3 }
              : timeSpec === common.TimeSpecEnum.Months
                ? { months: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Weeks
                  ? { days: timeColumnsLimit * 7 }
                  : timeSpec === common.TimeSpecEnum.Days
                    ? { days: timeColumnsLimit }
                    : timeSpec === common.TimeSpecEnum.Hours
                      ? { hours: timeColumnsLimit }
                      : timeSpec === common.TimeSpecEnum.Minutes
                        ? { minutes: timeColumnsLimit }
                        : {}
        );
      } else {
        endDate = add(
          startDate,
          timeSpec === common.TimeSpecEnum.Years
            ? { years: timeColumnsLimit }
            : timeSpec === common.TimeSpecEnum.Quarters
              ? { months: timeColumnsLimit * 3 }
              : timeSpec === common.TimeSpecEnum.Months
                ? { months: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Weeks
                  ? { days: timeColumnsLimit * 7 }
                  : timeSpec === common.TimeSpecEnum.Days
                    ? { days: timeColumnsLimit }
                    : timeSpec === common.TimeSpecEnum.Hours
                      ? { hours: timeColumnsLimit }
                      : timeSpec === common.TimeSpecEnum.Minutes
                        ? { minutes: timeColumnsLimit }
                        : {}
        );
      }
    }

    let timeColumns =
      common.isDefined(startDate) &&
      common.isDefined(endDate) &&
      getUnixTime(startDate) === getUnixTime(endDate)
        ? timeSpec === common.TimeSpecEnum.Timestamps
          ? [startDate]
          : timeSpec === common.TimeSpecEnum.Years
            ? [startOfYear(startDate)]
            : timeSpec === common.TimeSpecEnum.Quarters
              ? [startOfQuarter(startDate)]
              : timeSpec === common.TimeSpecEnum.Months
                ? [startOfMonth(startDate)]
                : timeSpec === common.TimeSpecEnum.Weeks
                  ? [
                      startOfWeek(startDate, {
                        weekStartsOn:
                          projectWeekStart ===
                          common.ProjectWeekStartEnum.Sunday
                            ? 0
                            : 1
                      })
                    ]
                  : timeSpec === common.TimeSpecEnum.Days
                    ? [startOfDay(startDate)]
                    : timeSpec === common.TimeSpecEnum.Hours
                      ? [startOfHour(startDate)]
                      : timeSpec === common.TimeSpecEnum.Minutes
                        ? [startOfMinute(startDate)]
                        : undefined
        : timeSpec === common.TimeSpecEnum.Years
          ? eachYearOfInterval({
              start: startDate,
              end: endDate
            })
          : timeSpec === common.TimeSpecEnum.Quarters
            ? eachQuarterOfInterval({
                start: startDate,
                end: endDate
              })
            : timeSpec === common.TimeSpecEnum.Months
              ? eachMonthOfInterval({
                  start: startDate,
                  end: endDate
                })
              : timeSpec === common.TimeSpecEnum.Weeks
                ? eachWeekOfInterval(
                    {
                      start: startDate,
                      end: endDate
                    },
                    {
                      weekStartsOn:
                        projectWeekStart === common.ProjectWeekStartEnum.Sunday
                          ? 0
                          : 1
                    }
                  )
                : timeSpec === common.TimeSpecEnum.Days
                  ? eachDayOfInterval({
                      start: startDate,
                      end: endDate
                    })
                  : timeSpec === common.TimeSpecEnum.Hours
                    ? eachHourOfInterval({
                        start: startDate,
                        end: endDate
                      })
                    : timeSpec === common.TimeSpecEnum.Minutes
                      ? eachMinuteOfInterval({
                          start: startDate,
                          end: endDate
                        })
                      : timeSpec === common.TimeSpecEnum.Timestamps &&
                          common.isDefined(startDate) &&
                          common.isDefined(endDate)
                        ? [startDate, endDate]
                        : timeSpec === common.TimeSpecEnum.Timestamps &&
                            common.isDefined(startDate)
                          ? [startDate]
                          : timeSpec === common.TimeSpecEnum.Timestamps &&
                              common.isDefined(endDate)
                            ? [endDate]
                            : undefined;

    if (
      timeSpec !== common.TimeSpecEnum.Timestamps &&
      timeColumns.length > 1 &&
      getUnixTime(timeColumns[timeColumns.length - 1]) === getUnixTime(endDate)
    ) {
      timeColumns.pop();
    }

    if (
      timeSpec !== common.TimeSpecEnum.Timestamps &&
      timeColumns.length > timeColumnsLimit
    ) {
      if (
        [
          common.FractionTypeEnum.TsIsBefore,
          common.FractionTypeEnum.TsIsThrough
        ].indexOf(timeRangeFraction.type) > -1
      ) {
        console.log('timeColumns.shift()');
        timeColumns.shift(); // detail "years" is before calendar day "2025-01-02"
      } else {
        console.log('timeColumns.pop()');
        timeColumns.pop(); // detail "years" is after calendar day "2025-01-02"
      }
    }

    let columns = timeColumns.map(x => {
      let unixTimeZoned = getUnixTime(x);
      // let unixDateZoned = new Date(unixTimeZoned * 1000);
      // let tsUTC = getUnixTime(fromZonedTime(unixDateZoned, timezone));

      let column: common.Column = {
        columnId: unixTimeZoned,
        // tsUTC: tsUTC,
        label: nodeCommon.nodeFormatTsUnix({
          timeSpec: timeSpec,
          unixTimeZoned: unixTimeZoned
        })
      };

      return column;
    });

    return {
      columns: columns,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded,
      timeColumnsLimit: timeColumnsLimit,
      timeRangeFraction: timeRangeFraction,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd
    };
  }
}
