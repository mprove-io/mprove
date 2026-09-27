import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetChartError = BackendError;

export let zToBackendGetChartError = zBackendError;

assertTypesEqual<
  ToBackendGetChartError,
  z.infer<typeof zToBackendGetChartError>
>({ value: true });
