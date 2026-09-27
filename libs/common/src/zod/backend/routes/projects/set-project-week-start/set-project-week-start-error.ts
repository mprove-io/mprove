import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSetProjectWeekStartError = BackendError;

export let zToBackendSetProjectWeekStartError = zBackendError;

assertTypesEqual<
  ToBackendSetProjectWeekStartError,
  z.infer<typeof zToBackendSetProjectWeekStartError>
>({ value: true });
