import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type DashboardLt = {
  content: any;
};

export let zDashboardLt = z
  .object({ content: z.any() })
  .meta({ id: 'DashboardLt' });

assertTypesEqual<DashboardLt, z.infer<typeof zDashboardLt>>({ value: true });
