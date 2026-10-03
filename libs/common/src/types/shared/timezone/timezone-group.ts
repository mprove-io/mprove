import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type Timezone,
  zTimezone
} from '#common/types/shared/timezone/timezone';

export type TimezoneGroup = { group: string; zones: Timezone[] };

export let zTimezoneGroup = z
  .object({
    group: z.string(),
    zones: z.array(zTimezone)
  })
  .meta({ id: 'TimezoneGroup' });

assertTypesEqual<TimezoneGroup, z.infer<typeof zTimezoneGroup>>({
  value: true
});
