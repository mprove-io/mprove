import { Injectable } from '@nestjs/common';
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
import { fromZonedTime } from 'date-fns-tz';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { processRowIds } from '~backend/functions/process-row-ids';
import { DbService } from '~backend/services/db.service';
import { RabbitService } from './rabbit.service';

@Injectable()
export class BlockmlService {
  constructor(
    private connectionsRepository: repositories.ConnectionsRepository,
    private evsRepository: repositories.EvsRepository,
    private rabbitService: RabbitService,
    private dbService: DbService
  ) {}

  async rebuildStruct(item: {
    traceId: string;
    projectId: string;
    structId: string;
    envId: string;
    orgId: string;
    diskFiles: common.DiskCatalogFile[];
    mproveDir: string;
    skipDb?: boolean;
    connections?: common.ProjectConnection[];
    evs?: common.Ev[];
  }) {
    let {
      traceId,
      structId,
      orgId,
      projectId,
      envId,
      diskFiles,
      skipDb,
      connections,
      evs
    } = item;

    let connectionsEntities;
    if (common.isUndefined(connections)) {
      connectionsEntities = await this.connectionsRepository.find({
        where: {
          project_id: projectId,
          env_id: envId
        }
      });
    }

    let evsEntities;
    if (common.isUndefined(evs)) {
      evsEntities = await this.evsRepository.find({
        where: {
          project_id: projectId,
          env_id: envId
        }
      });
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
          orgId: orgId,
          projectId: projectId,
          envId: envId,
          evs: evs || evsEntities.map(x => wrapper.wrapToApiEv(x)),
          mproveDir: item.mproveDir,
          files: helper.diskFilesToBlockmlFiles(diskFiles),
          connections:
            connections ||
            connectionsEntities.map(x => ({
              connectionId: x.connection_id,
              type: x.type,
              bigqueryProject: x.bigquery_project
            }))
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

    let {
      mproveDirValue,
      weekStart,
      allowTimezones,
      defaultTimezone,
      formatNumber,
      currencyPrefix,
      currencySuffix,
      errors,
      views,
      udfsDict,
      vizs,
      metrics,
      reps,
      apis,
      mconfigs,
      queries,
      dashboards,
      models
    } = blockmlRebuildStructResponse.payload;

    let struct = maker.makeStruct({
      projectId: projectId,
      structId: structId,
      mproveDirValue: mproveDirValue,
      weekStart: weekStart,
      allowTimezones: common.booleanToEnum(allowTimezones),
      defaultTimezone: defaultTimezone,
      formatNumber: formatNumber,
      currencyPrefix: currencyPrefix,
      currencySuffix: currencySuffix,
      errors: errors,
      views: views,
      udfsDict: udfsDict
    });

    reps.forEach(rep => {
      let newRows = processRowIds({
        rows: rep.rows,
        targetRowIds: rep.rows.map(r => r.rowId)
      });

      rep.rows = newRows;
    });

    if (common.isUndefined(skipDb) || skipDb === false) {
      await this.dbService.writeRecords({
        modify: false,
        records: {
          structs: [struct],
          vizs: vizs.map(x => wrapper.wrapToEntityViz(x)),
          queries: queries.map(x => wrapper.wrapToEntityQuery(x)),
          models: models.map(x => wrapper.wrapToEntityModel(x)),
          metrics: metrics.map(x => wrapper.wrapToEntityMetric(x)),
          reps: reps.map(rep => wrapper.wrapToEntityRep(rep)),
          apis: apis.map(x => wrapper.wrapToEntityApi(x)),
          mconfigs: mconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
          dashboards: dashboards.map(x => wrapper.wrapToEntityDashboard(x))
        }
      });
    }
    // else {
    //   let modifiedStruct = Object.assign({}, oldStruct, {
    //     errors: struct.errors
    //   });

    //   await this.dbService.writeRecords({
    //     modify: true,
    //     records: {
    //       structs: [modifiedStruct]
    //     }
    //   });
    // }

    return {
      struct: struct,
      models: models,
      metrics: metrics,
      apis: apis,
      reps: reps,
      vizs: vizs,
      dashboards: dashboards,
      mconfigs: mconfigs,
      queries: queries
    };
  }

  async getTimeColumns(item: {
    traceId: string;
    timezone: string;
    timeSpec: common.TimeSpecEnum;
    timeRangeFractionBrick: string;
    projectWeekStart: common.ProjectWeekStartEnum;
  }) {
    let {
      traceId,
      timezone,
      timeSpec,
      timeRangeFractionBrick,
      projectWeekStart
    } = item;

    let timeColumnsLimit = constants.TIME_COLUMNS_LIMIT;

    let toBlockmlGetTimeRangeRequest: apiToBlockml.ToBlockmlGetTimeRangeRequest =
      {
        info: {
          name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlGetTimeRange,
          traceId: traceId
        },
        payload: {
          timeRangeFractionBrick: timeRangeFractionBrick,
          timeColumnsLimit: timeColumnsLimit,
          timeSpec: timeSpec,
          timezone: timezone
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

    let rangeStart = blockmlGetTimeRangeResponse.payload.rangeStart;
    let rangeEnd = blockmlGetTimeRangeResponse.payload.rangeEnd;

    let startDate = new Date(rangeStart * 1000);
    let endDate = new Date(rangeEnd * 1000);

    let diffColumnsLength =
      timeSpec === common.TimeSpecEnum.Years
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
          common.FractionTypeEnum.TsIsInLast,
          common.FractionTypeEnum.TsIsBeforeDate,
          common.FractionTypeEnum.TsIsBeforeRelative
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
      getUnixTime(startDate) === getUnixTime(endDate)
        ? timeSpec === common.TimeSpecEnum.Years
          ? [startOfYear(startDate)]
          : timeSpec === common.TimeSpecEnum.Quarters
          ? [startOfQuarter(startDate)]
          : timeSpec === common.TimeSpecEnum.Months
          ? [startOfMonth(startDate)]
          : timeSpec === common.TimeSpecEnum.Weeks
          ? [
              startOfWeek(startDate, {
                weekStartsOn:
                  projectWeekStart === common.ProjectWeekStartEnum.Sunday
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
                projectWeekStart === common.ProjectWeekStartEnum.Sunday ? 0 : 1
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
        : undefined;

    if (
      timeColumns.length > 1 &&
      getUnixTime(timeColumns[timeColumns.length - 1]) === getUnixTime(endDate)
    ) {
      timeColumns.pop();
    }

    if (timeColumns.length > timeColumnsLimit) {
      if (
        [
          common.FractionTypeEnum.TsIsInLast,
          common.FractionTypeEnum.TsIsBeforeDate,
          common.FractionTypeEnum.TsIsBeforeRelative
        ].indexOf(timeRangeFraction.type) > -1
      ) {
        timeColumns.shift();
      } else {
        timeColumns.pop();
      }
    }

    let columns = timeColumns.map(x => {
      let unixTimeZoned = getUnixTime(x);
      let unixDateZoned = new Date(unixTimeZoned * 1000);
      let tsShifted = getUnixTime(fromZonedTime(unixDateZoned, timezone));

      let column: common.Column = {
        columnId: unixTimeZoned,
        tsShifted: tsShifted,
        label: common.formatTs({
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
      timeRangeFraction: timeRangeFraction
    };
  }
}
