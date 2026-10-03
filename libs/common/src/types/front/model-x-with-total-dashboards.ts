import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ModelX, zModelX } from '#common/types/backend/parts/model-x';
import type { Extend } from '#common/types/extend';

export type ModelXWithTotalDashboards = Extend<
  ModelX,
  { totalDashboards: number }
>;

export let zModelXWithTotalDashboards = zModelX
  .extend({
    totalDashboards: z.number()
  })
  .meta({ id: 'ModelXWithTotalDashboards' });

assertTypesEqual<
  ModelXWithTotalDashboards,
  z.infer<typeof zModelXWithTotalDashboards>
>({ value: true });
