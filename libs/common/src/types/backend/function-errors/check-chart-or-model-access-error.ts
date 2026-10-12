import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendForbiddenModelError,
  zBackendForbiddenModelError
} from '#common/types/backend/errors/backend-forbidden-model-error';

export type CheckChartOrModelAccessError = BackendForbiddenModelError;

export let zCheckChartOrModelAccessError = zBackendForbiddenModelError;

assertTypesEqual<
  CheckChartOrModelAccessError,
  z.infer<typeof zCheckChartOrModelAccessError>
>({ value: true });
