import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenChartPathError,
  zBackendForbiddenChartPathError
} from '#common/types/backend/errors/backend-forbidden-chart-path-error';

export type CheckChartPathError = BackendForbiddenChartPathError;

export let zCheckChartPathError = zBackendForbiddenChartPathError;

assertTypesEqual<CheckChartPathError, z.infer<typeof zCheckChartPathError>>({
  value: true
});
