import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteChartError = BackendError;

export let zToBackendDeleteChartError = zBackendError;

assertTypesEqual<
  ToBackendDeleteChartError,
  z.infer<typeof zToBackendDeleteChartError>
>({ value: true });
