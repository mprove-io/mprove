import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type TimeSpec, zTimeSpec } from '#common/types/shared/time/timespec';

import {
  type TimezoneString,
  zTimezone
} from '#common/types/shared/timezone/z-timezone';

export type Rq = {
  fractionBrick: string;
  timezone: TimezoneString;
  timeSpec: TimeSpec;
  timeStartTs: number;
  timeEndTs: number;
  mconfigId: string;
  queryId: string;
  kitId: string;
  lastCalculatedTs?: number;
};

export let zRq = z
  .object({
    fractionBrick: z.string(),
    timezone: zTimezone,
    timeSpec: zTimeSpec,
    timeStartTs: z.number().int(),
    timeEndTs: z.number().int(),
    mconfigId: z.string(),
    queryId: z.string(),
    kitId: z.string(),
    lastCalculatedTs: z.number().int().nullish()
  })
  .meta({ id: 'Rq' });

assertTypesEqual<Rq, z.infer<typeof zRq>>({ value: true });
