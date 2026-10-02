import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendForbiddenChartPathError = {
  code: 'BACKEND_FORBIDDEN_CHART_PATH';
};

export let zBackendForbiddenChartPathError = z.object({
  code: z.literal('BACKEND_FORBIDDEN_CHART_PATH')
});

assertTypesEqual<
  BackendForbiddenChartPathError,
  z.infer<typeof zBackendForbiddenChartPathError>
>({ value: true });
