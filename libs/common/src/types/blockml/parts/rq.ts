import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';
import {
  type TimezoneString,
  zTimezone
} from '#common/types/shared/timezone/z-timezone';

export type Rq = {
  fractionBrick: string;
  timezone: TimezoneString;
  timeSpec: EnumValues<typeof TimeSpecEnum>;
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
    timeSpec: z.enum(TimeSpecEnum),
    timeStartTs: z.number().int(),
    timeEndTs: z.number().int(),
    mconfigId: z.string(),
    queryId: z.string(),
    kitId: z.string(),
    lastCalculatedTs: z.number().int().nullish()
  })
  .meta({ id: 'Rq' });

assertTypesEqual<Rq, z.infer<typeof zRq>>({ value: true });
