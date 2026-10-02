import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendChartIsNotDraftError = {
  code: 'BACKEND_CHART_IS_NOT_DRAFT';
};

export let zBackendChartIsNotDraftError = z.object({
  code: z.literal('BACKEND_CHART_IS_NOT_DRAFT')
});

assertTypesEqual<
  BackendChartIsNotDraftError,
  z.infer<typeof zBackendChartIsNotDraftError>
>({ value: true });
