import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

// 2019-06-27 12:32:02.230908+00
export const timeframeValues = [
  // TODO: check supported timeframe values
  'date', // 2019-06-27
  'date_ts', //
  'day_of_month', // 27
  'day_of_week', // Thursday
  'day_of_week_index', // 5 or 4
  'day_of_year', // 178
  'hour', // 2019-06-27 12
  'hour_ts', //
  'hour_of_day', // 12
  'hour2', // 2019-06-27 12
  'hour3',
  'hour4',
  'hour6',
  'hour8',
  'hour12',
  'minute', // 2019-06-27 12:32
  'minute_ts', //
  'minute2', // 2019-06-27 12:32
  'minute3',
  'minute5',
  'minute10',
  'minute15',
  'minute30',
  'month', // 2019-06
  'month_ts', //
  'month_name', // June
  'month_num', // 6
  'quarter', // 2019-04
  'quarter_ts', //
  'quarter_of_year', // Q2
  'time', // 2019-06-27 12:32:02
  'time_of_day', // 12:32
  'ts', //
  'week', // 2019-06-24
  'week_ts', //
  'week_of_year', // 26
  'year', // 2019
  'year_ts', //
  'yesno_has_value' // Yes
] as const;

export type Timeframe = (typeof timeframeValues)[number];

export let zTimeframe = z.enum(timeframeValues);

assertTypesEqual<Timeframe, z.infer<typeof zTimeframe>>({
  value: true
});
