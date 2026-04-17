import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { zTimezone } from '#common/zod/z-timezone';

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

export type Rq = z.infer<typeof zRq>;
