import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenChartPathError,
  zBackendForbiddenChartPathError
} from '#common/types/backend/errors/backend-forbidden-chart-path-error';

export type CheckChartPathResultError = BackendForbiddenChartPathError;

export let zCheckChartPathResultError = zBackendForbiddenChartPathError;

assertTypesEqual<
  CheckChartPathResultError,
  z.infer<typeof zCheckChartPathResultError>
>({ value: true });
