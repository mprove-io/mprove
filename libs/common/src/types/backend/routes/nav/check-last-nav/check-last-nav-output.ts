import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCheckLastNavOutput = {
  isModelExist: boolean;
  isChartExist: boolean;
  isDashboardExist: boolean;
  isReportExist: boolean;
};

export let zToBackendCheckLastNavOutput = z
  .object({
    isModelExist: z.boolean(),
    isChartExist: z.boolean(),
    isDashboardExist: z.boolean(),
    isReportExist: z.boolean()
  })
  .meta({ id: 'ToBackendCheckLastNavOutput' });

assertTypesEqual<
  ToBackendCheckLastNavOutput,
  z.infer<typeof zToBackendCheckLastNavOutput>
>({ value: true });
