import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendChartCreatorIdMismatchError = {
  code: 'BACKEND_CHART_CREATOR_ID_MISMATCH';
};

export let zBackendChartCreatorIdMismatchError = z.object({
  code: z.literal('BACKEND_CHART_CREATOR_ID_MISMATCH')
});

assertTypesEqual<
  BackendChartCreatorIdMismatchError,
  z.infer<typeof zBackendChartCreatorIdMismatchError>
>({ value: true });
