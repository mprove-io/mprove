import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendChartDoesNotExistError = {
  code: 'BACKEND_CHART_DOES_NOT_EXIST';
};

export let zBackendChartDoesNotExistError = z.object({
  code: z.literal('BACKEND_CHART_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendChartDoesNotExistError,
  z.infer<typeof zBackendChartDoesNotExistError>
>({ value: true });
