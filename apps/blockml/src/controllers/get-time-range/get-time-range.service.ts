import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { add, fromUnixTime, getUnixTime, sub } from 'date-fns';
import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { nodeCommon } from '~blockml/barrels/node-common';
import { bricksToFractions } from '~node-common/functions/bricks-to-fractions';

@Injectable()
export class GetTimeRangeService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async get(request: any) {
    if (
      request.info?.name !==
      apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlGetTimeRange
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BLOCKML_WRONG_REQUEST_INFO_NAME
      });
    }

    let reqValid = nodeCommon.transformValidSync({
      classType: apiToBlockml.ToBlockmlGetTimeRangeRequest,
      object: request,
      errorMessage: common.ErEnum.BLOCKML_WRONG_REQUEST_PARAMS,
      logIsJson:
        this.cs.get<interfaces.Config['blockmlLogIsJson']>('blockmlLogIsJson'),
      logger: this.logger
    });

    let {
      timeRangeFractionBrick,
      timeColumnsLimit,
      timeSpec,
      timezone,
      weekStart,
      caseSensitiveStringFilters
    } = reqValid.payload;

    let fractions: common.Fraction[] = [];

    let p = bricksToFractions({
      // caseSensitiveStringFilters: caseSensitiveStringFilters,
      filterBricks: [timeRangeFractionBrick],
      result: common.FieldResultEnum.Ts,
      fractions: fractions,
      getTimeRange: true,
      timezone: timezone,
      weekStart: weekStart
    });

    // let p = processFilter({
    //   caseSensitiveStringFilters: caseSensitiveStringFilters,
    //   filterBricks: [timeRangeFractionBrick],
    //   result: common.FieldResultEnum.Ts,
    //   fractions: fractions,
    //   getTimeRange: true,
    //   timezone: timezone
    // });

    let timeRangeFraction = fractions[0];

    if (p.valid !== 1) {
      let payload: apiToBlockml.ToBlockmlGetTimeRangeResponsePayload = {
        isValid: false,
        // rangeOpen: undefined,
        // rangeClose: undefined,
        rangeStart: undefined,
        rangeEnd: undefined,
        timeRangeFraction: undefined
      };

      return payload;
    }

    // console.log('p.rangeStart');
    // console.log(p.rangeStart);
    // console.log('p.rangeEnd');
    // console.log(p.rangeEnd);

    let rangeStart =
      common.isUndefined(p.rangeStart) && common.isUndefined(p.rangeEnd)
        ? undefined
        : common.isDefined(p.rangeStart)
          ? p.rangeStart
          : timeSpec === common.TimeSpecEnum.Timestamps
            ? undefined
            : getUnixTime(
                sub(
                  fromUnixTime(p.rangeEnd),
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

    // console.log('rangeStart');
    // console.log(rangeStart);

    let rangeEnd =
      common.isUndefined(p.rangeStart) && common.isUndefined(p.rangeEnd)
        ? undefined
        : common.isDefined(p.rangeEnd)
          ? p.rangeEnd
          : timeSpec === common.TimeSpecEnum.Timestamps
            ? undefined
            : getUnixTime(
                add(
                  fromUnixTime(p.rangeStart),
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

    // console.log('rangeEnd');
    // console.log(rangeEnd);

    //   let start =
    //   common.isDefined(rangeOpen) && common.isDefined(rangeClose)
    //     ? Math.min(rangeOpen, rangeClose)
    //     : common.isUndefined(rangeOpen)
    //       ? undefined
    //       : [
    //             common.FractionTypeEnum.TsIsBefore,
    //             common.FractionTypeEnum.TsIsBeforeRelative
    //           ].indexOf(timeRangeFraction.type) > -1 &&
    //           timeSpec !== common.TimeSpecEnum.Timestamps
    //         ? getUnixTime(
    //             sub(
    //               fromUnixTime(rangeOpen),
    //               timeSpec === common.TimeSpecEnum.Years
    //                 ? { years: timeColumnsLimit }
    //                 : timeSpec === common.TimeSpecEnum.Quarters
    //                   ? { months: timeColumnsLimit * 3 }
    //                   : timeSpec === common.TimeSpecEnum.Months
    //                     ? { months: timeColumnsLimit }
    //                     : timeSpec === common.TimeSpecEnum.Weeks
    //                       ? { days: timeColumnsLimit * 7 }
    //                       : timeSpec === common.TimeSpecEnum.Days
    //                         ? { days: timeColumnsLimit }
    //                         : timeSpec === common.TimeSpecEnum.Hours
    //                           ? { hours: timeColumnsLimit }
    //                           : timeSpec === common.TimeSpecEnum.Minutes
    //                             ? { minutes: timeColumnsLimit }
    //                             : {}
    //             )
    //           )
    //         : [
    //               common.FractionTypeEnum.TsIsAfter,
    //               common.FractionTypeEnum.TsIsAfterRelative
    //             ].indexOf(timeRangeFraction.type) > -1
    //           ? rangeOpen
    //           : undefined;

    // let end =
    //   common.isDefined(rangeOpen) && common.isDefined(rangeClose)
    //     ? Math.max(rangeOpen, rangeClose)
    //     : common.isUndefined(rangeOpen)
    //       ? undefined
    //       : [
    //             common.FractionTypeEnum.TsIsBefore,
    //             common.FractionTypeEnum.TsIsBeforeRelative
    //           ].indexOf(timeRangeFraction.type) > -1
    //         ? rangeOpen
    //         : [
    //               common.FractionTypeEnum.TsIsAfter,
    //               common.FractionTypeEnum.TsIsAfterRelative
    //             ].indexOf(timeRangeFraction.type) > -1 &&
    //             timeSpec !== common.TimeSpecEnum.Timestamps
    //           ? getUnixTime(
    //               add(
    //                 fromUnixTime(rangeOpen),
    //                 timeSpec === common.TimeSpecEnum.Years
    //                   ? { years: timeColumnsLimit }
    //                   : timeSpec === common.TimeSpecEnum.Quarters
    //                     ? { months: timeColumnsLimit * 3 }
    //                     : timeSpec === common.TimeSpecEnum.Months
    //                       ? { months: timeColumnsLimit }
    //                       : timeSpec === common.TimeSpecEnum.Weeks
    //                         ? { days: timeColumnsLimit * 7 }
    //                         : timeSpec === common.TimeSpecEnum.Days
    //                           ? { days: timeColumnsLimit }
    //                           : timeSpec === common.TimeSpecEnum.Hours
    //                             ? { hours: timeColumnsLimit }
    //                             : timeSpec === common.TimeSpecEnum.Minutes
    //                               ? { minutes: timeColumnsLimit }
    //                               : {}
    //               )
    //             )
    //           : undefined;

    let payload: apiToBlockml.ToBlockmlGetTimeRangeResponsePayload = {
      isValid: p.valid === 1,
      // rangeOpen: rangeOpen,
      // rangeClose: rangeClose,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      timeRangeFraction: timeRangeFraction
    };

    return payload;
  }
}
