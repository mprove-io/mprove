import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetDashboardsError = BackendError;

export let zToBackendGetDashboardsError = zBackendError;

assertTypesEqual<
  ToBackendGetDashboardsError,
  z.infer<typeof zToBackendGetDashboardsError>
>({ value: true });
