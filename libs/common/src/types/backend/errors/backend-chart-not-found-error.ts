import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendChartNotFoundError = {
  code: 'BACKEND_CHART_NOT_FOUND';
  displayData?: { id: string };
};

export let zBackendChartNotFoundError = z.object({
  code: z.literal('BACKEND_CHART_NOT_FOUND'),
  displayData: z.object({ id: z.string() }).nullish()
});

assertTypesEqual<
  BackendChartNotFoundError,
  z.infer<typeof zBackendChartNotFoundError>
>({ value: true });
