import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGroupMetricByDimensionError = BackendError;

export let zToBackendGroupMetricByDimensionError = zBackendError;

assertTypesEqual<
  ToBackendGroupMetricByDimensionError,
  z.infer<typeof zToBackendGroupMetricByDimensionError>
>({ value: true });
