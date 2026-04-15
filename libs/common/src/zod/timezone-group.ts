import { z } from 'zod';
import { zTimezone } from '#common/zod/timezone';

export let zTimezoneGroup = z
  .object({
    group: z.string(),
    zones: z.array(zTimezone)
  })
  .meta({ id: 'TimezoneGroup' });

export type TimezoneGroup = z.infer<typeof zTimezoneGroup>;
