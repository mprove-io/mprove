import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetDashboardError = BackendError;

export let zToBackendGetDashboardError = zBackendError;

assertTypesEqual<
  ToBackendGetDashboardError,
  z.infer<typeof zToBackendGetDashboardError>
>({ value: true });
