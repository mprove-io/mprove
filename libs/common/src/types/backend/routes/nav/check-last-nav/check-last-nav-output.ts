import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCheckLastNavOutput = {
  modelExists: boolean;
  chartExists: boolean;
  dashboardExists: boolean;
  reportExists: boolean;
};

export let zToBackendCheckLastNavOutput = z
  .object({
    modelExists: z.boolean(),
    chartExists: z.boolean(),
    dashboardExists: z.boolean(),
    reportExists: z.boolean()
  })
  .meta({ id: 'ToBackendCheckLastNavOutput' });

assertTypesEqual<
  ToBackendCheckLastNavOutput,
  z.infer<typeof zToBackendCheckLastNavOutput>
>({ value: true });
