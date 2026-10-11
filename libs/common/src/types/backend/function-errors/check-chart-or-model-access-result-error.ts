import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenModelError,
  zBackendForbiddenModelError
} from '#common/types/backend/errors/backend-forbidden-model-error';

export type CheckChartOrModelAccessResultError = BackendForbiddenModelError;

export let zCheckChartOrModelAccessResultError = zBackendForbiddenModelError;

assertTypesEqual<
  CheckChartOrModelAccessResultError,
  z.infer<typeof zCheckChartOrModelAccessResultError>
>({ value: true });
